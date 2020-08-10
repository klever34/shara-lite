import Realm, {UpdateMode} from 'realm';
import {IContact, IConversation, IMessage} from '../../models';
import {IPubNubService} from '../pubnub';
import PubNub from 'pubnub';
import {decrypt, generateUniqueId} from '../../helpers/utils';
import {IApiService} from '../api';
import {IAuthService} from '../auth';
import {compact, omit} from 'lodash';
import {ChannelCustom} from '../../../types/app';
import {getBaseModelValues} from '../../helpers/models';
import {getMessageByPubnubId} from '../MessageService';
import {getConversationByChannel} from '../ConversationService';
import {getContactByMobile} from '../ContactService';

export interface IRealmService {
  getInstance(): Realm | null;

  setInstance(realm: Realm): void;

  createContact(contact: IContact, updateMode: UpdateMode): Promise<IContact>;

  createMultipleContacts(
    contact: IContact[],
    updateMode: UpdateMode,
  ): Promise<IContact[]>;

  updateContact(contact: Partial<IContact>): Promise<IContact>;

  updateMultipleContacts(contact: Partial<IContact[]>): Promise<IContact[]>;

  // createMessage(message: IMessage): Promise<IMessage>;
  // updateMessage(message: IMessage): Promise<IMessage>;
  restoreAllMessages(): Promise<void>;

  // createConversation(conversation: IConversation): Promise<IConversation>;
  // updateConversation(conversation: IConversation): Promise<IConversation>;
  restoreAllConversations(): Promise<void>;

  getConversationFromChannelMetadata(
    channelMetadata: PubNub.ChannelMetadataObject<PubNub.ObjectCustom>,
  ): Promise<IConversation>;

  clearRealm(): void;
}

export class RealmService implements IRealmService {
  private realm: Realm | null = null;

  constructor(
    private apiService: IApiService,
    private authService: IAuthService,
    private pubNubService: IPubNubService,
  ) {}

  public getInstance() {
    return this.realm;
  }

  public setInstance(realm: Realm) {
    if (!this.realm) {
      this.realm = realm;
    }
  }

  createContact(
    contact: IContact,
    updateMode: UpdateMode = UpdateMode.Never,
  ): Promise<IContact> {
    const realm = this.realm as Realm;
    return new Promise<IContact>((resolve, reject) => {
      const existingMobile = getContactByMobile({
        realm,
        mobile: contact.mobile,
      });
      const updatePayload = existingMobile || getBaseModelValues();
      try {
        realm.write(() => {
          const createdContact = realm.create<IContact>(
            'Contact',
            {...contact, ...updatePayload},
            updateMode,
          );
          resolve(createdContact);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  createMultipleContacts(
    contacts: IContact[],
    updateMode: UpdateMode = UpdateMode.Never,
  ): Promise<IContact[]> {
    const realm = this.realm as Realm;
    return new Promise<IContact[]>((resolve, reject) => {
      try {
        realm.write(() => {
          const createdContacts = contacts.map((contact) => {
            const newContact = {
              ...contact,
              ...getBaseModelValues(),
            };
            return realm.create<IContact>('Contact', newContact, updateMode);
          });
          resolve(createdContacts);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  updateContact(contact: Partial<IContact>): Promise<IContact> {
    return this.createContact(contact as IContact, UpdateMode.Modified);
  }

  updateMultipleContacts(contacts: Partial<IContact[]>): Promise<IContact[]> {
    return this.createMultipleContacts(
      contacts as IContact[],
      UpdateMode.Modified,
    );
  }

  clearRealm() {
    const realm = this.realm as Realm;
    if (realm) {
      realm.write(() => {
        realm.deleteAll();
      });
    }
  }

  // createMessage(message: IMessage): Promise<IMessage> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }
  //
  // updateMessage(message: IMessage): Promise<IMessage> {
  //   return new Promise<IMessage>((resolve, reject) => {});
  // }

  async restoreAllMessages(): Promise<void> {
    const pubNub = this.pubNubService.getInstance();
    if (!this.realm || !pubNub) {
      return;
    }
    const channels = this.realm
      .objects<IConversation>('Conversation')
      .map(({channel}) => channel);
    try {
      for (let i = 0; i < channels.length; i++) {
        let channel = channels[i];
        const count = 25;
        let retrieved: number | undefined;
        let start: string | number | undefined;
        do {
          const response = await pubNub.fetchMessages({
            channels: [channel],
            start,
            count,
            includeMessageActions: true,
          });
          const messagePayload = response.channels[channel] ?? [];
          this.realm.write(() => {
            if (!this.realm) {
              return;
            }
            for (let j = 0; j < messagePayload.length; j += 1) {
              let {message, timetoken, actions} = messagePayload[j];
              let delivered_timetoken = null;
              let read_timetoken = null;
              if (!message.id) {
                continue;
              }
              let {message_delivered, message_read} = actions?.receipt ?? {};
              if (message_delivered) {
                delivered_timetoken = message_delivered[0].actionTimetoken;
                if (message_read) {
                  read_timetoken = message_read[0].actionTimetoken;
                }
              }

              const existingMessage = getMessageByPubnubId({
                realm: this.realm,
                messageId: message.id,
              });
              const updatePayload = existingMessage || getBaseModelValues();

              message = this.realm.create<IMessage>(
                'Message',
                {
                  ...message,
                  ...updatePayload,
                  timetoken,
                  delivered_timetoken,
                  read_timetoken,
                },
                UpdateMode.Modified,
              );
              if (j === messagePayload.length - 1 && retrieved === undefined) {
                const conversation = this.realm
                  .objects<IConversation>('Conversation')
                  .filtered(`channel="${channel}"`)[0];
                conversation.lastMessage = message;
              }
            }
          });
          retrieved = messagePayload.length;
          start = messagePayload[0]?.timetoken;
        } while (retrieved === count);
      }
    } catch (e) {
      throw e;
    }
  }

  // createConversation(conversation: IConversation): Promise<IConversation> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }
  //
  // updateConversation(conversation: IConversation): Promise<IConversation> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }

  async restoreAllConversations(): Promise<void> {
    const pubNub = this.pubNubService.getInstance();
    if (!this.realm || !pubNub) {
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
      const channels: string[] = [];
      const conversations: {[channel: string]: IConversation} = {};
      for (let i = 0; i < data.length; i += 1) {
        const {channel: channelMetadata} = data[i];
        try {
          const conversation = await this.getConversationFromChannelMetadata(
            channelMetadata,
          );
          const channel = channelMetadata.id;
          channels.push(channel);
          conversations[channel] = conversation;
        } catch (e) {}
      }
      this.realm.write(() => {
        if (!this.realm) {
          return;
        }

        for (let i = 0; i < channels.length; i += 1) {
          const channel = channels[i];
          const existingChannel = getConversationByChannel({
            realm: this.realm,
            channel,
          });
          const updatePayload = omit(
            existingChannel || getBaseModelValues(),
            [],
          );

          const conversation = this.realm.create<IConversation>(
            'Conversation',
            {...conversations[channel], ...updatePayload},
            UpdateMode.Modified,
          );
          if (conversation.type === 'group') {
            const members = conversation.members;
            for (let j = 0; j < members.length; j += 1) {
              const contact = this.realm
                .objects<IContact>('Contact')
                .filtered(`mobile = "${members[j]}"`)[0];
              if (contact) {
                this.realm.write(() => {
                  contact.groups = contact.groups
                    ? `${contact.groups},${channel}`
                    : channel;
                });
              }
            }
          } else {
            const contact = this.realm
              .objects<IContact>('Contact')
              .filtered(`mobile = "${conversation.name}"`)[0];
            if (contact) {
              this.realm.write(() => {
                conversation.name = contact.fullName;
                contact.channel = conversation.channel;
              });
            }
          }
        }
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
        return {
          id: String(custom.id),
          creatorId: String(custom.creatorId),
          creatorMobile: decrypt(custom.creatorMobile),
          name: channelMetadata.name ?? '',
          type: 'group',
          admins,
          members,
          channel,
        };
      } else {
        members = custom.members
          .split(',')
          .map((encryptedMember: any) => decrypt(encryptedMember));
        const user = this.authService.getUser();
        const sender =
          members.find((member: any) => member !== user?.mobile) ?? '';
        return {
          id: generateUniqueId(),
          name: sender,
          type: custom.type ?? '1-1',
          members,
          channel,
        };
      }
    } catch (e) {
      throw e;
    }
  }
}
