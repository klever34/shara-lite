import {IConversation} from '@/models';
import omit from 'lodash/omit';
import PubNub from 'pubnub';
import {getBaseModelValues} from '@/helpers/models';
import {UpdateMode} from 'realm';
import {ChannelCustom} from 'types/app';
import {compact} from 'lodash';
import {decrypt, generateUniqueId} from '@/helpers/utils';
import {IRealmService} from '@/services/realm';
import {IPubNubService} from '@/services/pubnub';
import {IAuthService} from '@/services/auth';
import {IApiService} from '@/services/api';
import {IContactService} from '@/services/contact';

export interface IConversationService {
  getConversationByChannel(channel: string): IConversation | null;

  getConversation(conversationId: string): IConversation | null;

  // createConversation(conversation: IConversation): Promise<IConversation>;
  // updateConversation(conversation: IConversation): Promise<IConversation>;
  restoreAllConversations(): Promise<void>;

  getConversationFromChannelMetadata(
    channelMetadata: PubNub.ChannelMetadataObject<PubNub.ObjectCustom>,
  ): Promise<IConversation>;
}

export class ConversationService implements IConversationService {
  constructor(
    private realmService: IRealmService,
    private pubNubService: IPubNubService,
    private authService: IAuthService,
    private apiService: IApiService,
    private contactService: IContactService,
  ) {}

  getConversationByChannel(channel: string): IConversation | null {
    const realm = this.realmService.getInstance();
    const foundConversations = realm
      ?.objects<IConversation>('Conversation')
      .filtered(`channel = "${channel}" LIMIT(1)`);
    return foundConversations?.length
      ? (omit(foundConversations[0]) as IConversation)
      : null;
  }

  getConversation(conversationId: string): IConversation | null {
    const realm = this.realmService.getInstance();
    return realm?.objectForPrimaryKey('Conversation', conversationId) || null;
  }

  // createConversation(conversation: IConversation): Promise<IConversation> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }
  //
  // updateConversation(conversation: IConversation): Promise<IConversation> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }

  private prepareConversation(conversation: IConversation): IConversation {
    if (conversation._id) {
      return conversation;
    }
    const prevConversation = this.getConversationByChannel(
      conversation.channel,
    );
    if (prevConversation) {
      conversation = {
        _id: prevConversation._id,
        ...conversation,
      };
    } else {
      conversation = {
        ...conversation,
        ...getBaseModelValues(),
      };
    }
    return conversation;
  }

  async restoreAllConversations(): Promise<void> {
    const pubNub = this.pubNubService.getInstance();
    const realm = this.realmService.getInstance();
    if (!realm || !pubNub) {
      return;
    }
    try {
      const {data} = await new Promise((resolve, reject) => {
        pubNub.objects.getMemberships(
          {
            uuid: pubNub.getUUID(),
            include: {
              customChannelFields: true,
            },
          },
          (status, response) => {
            if (status.error) {
              reject(status);
            } else {
              resolve(response);
            }
          },
        );
      });
      const conversations: IConversation[] = [];
      for (let i = 0; i < data.length; i += 1) {
        const {channel: channelMetadata} = data[i];
        try {
          let conversation = await this.getConversationFromChannelMetadata(
            channelMetadata,
          );
          conversation = this.prepareConversation(conversation);
          const channel = conversation.channel;
          if (conversation.type === 'group') {
            const members = conversation.members;
            for (let j = 0; j < members.length; j += 1) {
              const memberMobile = members[j];
              let contact = this.contactService.getContactByMobile(
                memberMobile,
              );
              if (!contact) {
                await this.contactService.syncMobiles([memberMobile], () => ({
                  groups: channel,
                }));
              } else {
                await this.contactService.updateContact({
                  _id: contact._id,
                  groups: contact.groups
                    ? `${contact.groups},${channel}`
                    : channel,
                });
              }
            }
          } else {
            let contact = this.contactService.getContactByMobile(
              conversation.name,
            );
            if (contact) {
              conversation.name = contact.fullName;
              await this.contactService.updateContact({
                _id: contact._id,
                channel: conversation.channel,
              });
            }
          }
          conversations.push(conversation);
        } catch (e) {}
      }
      realm.write(() => {
        conversations.forEach((conversation) => {
          realm.create<IConversation>(
            'Conversation',
            conversation,
            UpdateMode.Modified,
          );
        });
      });
    } catch (e) {
      throw e;
    }
  }

  async getConversationFromChannelMetadata(
    channelMetadata: PubNub.ChannelMetadataObject<PubNub.ObjectCustom>,
  ): Promise<IConversation> {
    const custom = channelMetadata.custom as ChannelCustom;
    const channel = channelMetadata.id;
    let conversation: IConversation;
    try {
      let members: string[];
      if (custom.type === 'group') {
        const groupChatMembers = await this.apiService.getGroupMembers(
          custom.id,
        );
        const admins = compact(
          groupChatMembers
            .filter((member) => {
              return !!member.is_admin;
            })
            .map((member) => member.user?.mobile),
        );
        members = compact(
          groupChatMembers.map((member) => member.user?.mobile),
        );
        const creator = decrypt(custom.creatorMobile);
        conversation = {
          id: String(custom.id),
          creator,
          name: channelMetadata.name ?? '',
          description: channelMetadata.description ?? '',
          type: 'group',
          admins,
          members,
          channel,
        };
      } else {
        members = custom.members
          .split(',')
          .map((encryptedMember) => decrypt(encryptedMember));
        const user = this.authService.getUser();
        const sender =
          members.find((member: any) => member !== user?.mobile) ?? '';
        conversation = {
          id: generateUniqueId(),
          name: sender,
          type: custom.type ?? '1-1',
          members,
          channel,
        };
      }
      return conversation;
    } catch (e) {
      throw e;
    }
  }
}
