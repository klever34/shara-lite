import {IConversation, IMessage} from 'app-v2/models';
import omit from 'lodash/omit';
import {IRealmService} from 'app-v2/services/realm';
import {getBaseModelValues} from 'app-v2/helpers/models';
import {UpdateMode} from 'realm';
import {IPubNubService} from 'app-v2/services/pubnub';

export interface IMessageService {
  getMessageByPubnubId(messageId: string): IMessage | null;

  getMessage(messageId: string): IMessage | null;
  // createMessage(message: IMessage): Promise<IMessage>;
  // updateMessage(message: IMessage): Promise<IMessage>;
  restoreAllMessages(): Promise<void>;
}

export class MessageService implements IMessageService {
  constructor(
    private realmService: IRealmService,
    private pubNubService: IPubNubService,
  ) {}

  getMessageByPubnubId(messageId: string): IMessage | null {
    const realm = this.realmService.getInstance();
    const foundMessages = realm
      ?.objects<IMessage>('Message')
      .filtered(`id = "${messageId}" LIMIT(1)`);
    return foundMessages?.length ? (omit(foundMessages[0]) as IMessage) : null;
  }

  getMessage(messageId: string): IMessage | null {
    const realm = this.realmService.getInstance();
    return realm?.objectForPrimaryKey<IMessage>('Message', messageId) || null;
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
    const realm = this.realmService.getInstance();
    if (!realm || !pubNub) {
      return;
    }
    const channels = realm
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
          realm.write(() => {
            if (!realm) {
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

              const existingMessage = this.getMessageByPubnubId(message.id);
              const updatePayload = existingMessage || getBaseModelValues();

              message = realm.create<IMessage>(
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
                const conversation = realm
                  .objects<IConversation>('Conversation')
                  .filtered(`channel="${channel}"`)[0];
                realm.create(
                  'Message',
                  {_id: message._id, lastMessage: conversation.lastMessage},
                  UpdateMode.Modified,
                );
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
}
