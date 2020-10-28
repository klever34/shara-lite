import {IConversation} from 'app-v3/models';
import omit from 'lodash/omit';
import PubNub from 'pubnub';
import {getBaseModelValues} from 'app-v3/helpers/models';
import {UpdateMode} from 'realm';
import {ChannelCustom} from 'types-v3/app';
import {compact} from 'lodash';
import {decrypt, generateUniqueId} from 'app-v3/helpers/utils';
import {IRealmService} from 'app-v3/services/realm';
import {IPubNubService} from 'app-v3/services/pubnub';
import {IAuthService} from 'app-v3/services/auth';
import {IApiService} from 'app-v3/services/api';
import {IContactService} from 'app-v3/services/contact';
import {Platform} from 'react-native';
import {getNotificationService} from 'app-v3/services/index';

export interface IConversationService {
  getConversationByChannel(channel: string): IConversation | null;

  getConversation(conversationId: string): IConversation | null;

  restoreAllConversations(): Promise<void>;

  getConversationFromChannelMetadata(
    channelMetadata: PubNub.ChannelMetadataObject<PubNub.ObjectCustom>,
  ): Promise<IConversation>;
  setUpSubscriptions(): () => void;
  setUpConversationNotification(): Promise<void>;
}

export class ConversationService implements IConversationService {
  public conversations?: Realm.Results<IConversation & Realm.Object>;
  constructor(
    private realmService: IRealmService,
    private pubNubService: IPubNubService,
    private authService: IAuthService,
    private apiService: IApiService,
    private contactService: IContactService,
  ) {
    const realm = realmService.getInstance();
    if (realm) {
      this.conversations = realm.objects<IConversation>('Conversation');
    }
  }

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

  public getAllConversationChannels(): string[] {
    const channels: string[] = [];
    channels.push(
      ...(this.conversations?.map((conversation) => conversation.channel) ??
        []),
    );
    return channels;
  }

  setUpSubscriptions(): () => void {
    const pubNub = this.pubNubService.getInstance();
    const channelGroups: string[] = [pubNub?.getUUID() ?? ''];
    const channels = this.getAllConversationChannels();
    pubNub?.subscribe({channels, channelGroups});
    return () => {
      pubNub?.unsubscribeAll();
    };
  }

  setUpConversationNotification(): Promise<void> {
    const channels = this.getAllConversationChannels();
    const pushGateway = Platform.select({android: 'gcm', ios: 'apns'});
    const notificationToken = getNotificationService().getNotificationToken();
    const pubNub = this.pubNubService.getInstance();
    if (pushGateway && notificationToken && pubNub) {
      return new Promise<any>((resolve, reject) => {
        pubNub.push.addChannels(
          {
            channels: [...channels, pubNub.getUUID()],
            device: notificationToken,
            pushGateway,
          },
          (status) => {
            if (status.error) {
              reject(status);
            }
          },
        );
      });
    } else {
      return Promise.resolve();
    }
  }
}
