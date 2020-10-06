import {useCallback, useEffect, useRef, useState} from 'react';
import {MessageEvent, SignalEvent} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../realm';
import {useErrorHandler} from 'app-v1/services/error-boundary';
import {
  getConversationService,
  getMessageService,
  getNotificationService,
  getPubNubService,
} from 'app-v1/services';
import {Notification} from 'app-v1/services/notification';
import {IContact, IConversation, IMessage} from 'app-v1/models';
import {getBaseModelValues} from 'app-v1/helpers/models';
import Realm from 'realm';
import {retryPromise} from 'app-v1/helpers/utils';
import {MessageActionEvent} from 'types-v1/pubnub';
import {useNavigation} from '@react-navigation/native';
import {useModal} from 'app-v1/helpers/hocs';

export const useTyping = (channel: string, input: string = '') => {
  const pubNub = usePubNub();
  useRealm();
  const [reset, setReset] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const timer = useRef<NodeJS.Timeout | null>(null);
  const handleError = useErrorHandler();
  const stopTyping = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsTyping(false);
    try {
      await new Promise<any>((resolve, reject) => {
        pubNub.signal(
          {
            channel,
            message: 'TYPING_OFF',
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
    } catch (e) {
      handleError(e);
    }
  }, [channel, handleError, pubNub]);
  const startTyping = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setIsTyping(true);
    try {
      await new Promise<any>((resolve, reject) => {
        pubNub.signal(
          {
            channel,
            message: 'TYPING_ON',
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
    } catch (e) {
      handleError(e);
    }
    //@ts-ignore
    timer.current = setTimeout(() => {
      setReset(false);
      stopTyping();
    }, 10000);
  }, [channel, handleError, pubNub, stopTyping]);
  useEffect(() => {
    if (input && !isTyping) {
      if (reset) {
        startTyping();
      }
    } else if (!input) {
      setReset(true);
      stopTyping();
    }
  }, [reset, input, isTyping, startTyping, stopTyping]);
  useEffect(() => {
    return getPubNubService().addSignalEventListener(
      (envelope: SignalEvent) => {
        if (
          channel === envelope.channel &&
          envelope.message === 'TYPING_ON' &&
          envelope.publisher !== pubNub.getUUID()
        ) {
          setTypingMessage('typing...');
        } else {
          setTypingMessage('');
        }
      },
    );
  }, [channel, pubNub]);
  return typingMessage;
};

export const useChat = () => {
  const navigation = useNavigation();
  const {openModal} = useModal();
  const realm = useRealm();
  const pubNub = usePubNub();
  const handleError = useErrorHandler();

  useCallback(async () => {
    const closeModal = openModal?.('loading', {text: 'Restoring messages...'});
    try {
      await getMessageService().restoreAllMessages();
    } catch (e) {
      handleError(e);
    }
    closeModal?.();
  }, [handleError, openModal]);

  useEffect(() => {
    return getConversationService().setUpSubscriptions();
  }, []);

  useEffect(() => {
    getConversationService().setUpConversationNotification().catch(handleError);
  }, [handleError]);

  useEffect(() => {
    getConversationService().restoreAllConversations().catch(handleError);
  }, [handleError]);

  useEffect(() => {
    const notificationService = getNotificationService();
    return notificationService.addEventListener(
      (notification: Notification) => {
        if (!notification.foreground) {
          const conversation = getConversationService().getConversationByChannel(
            notification.channel,
          ) as IConversation;
          navigation.navigate('Chat', conversation);
          notificationService.cancelAllLocalNotifications();
        }
      },
    );
  }, [navigation]);

  useEffect(() => {
    const pubNubService = getPubNubService();
    return pubNubService.addMessageEventListener(async (evt: MessageEvent) => {
      const {channel, publisher, timetoken} = evt;
      const message = evt.message as IMessage;
      try {
        if (publisher !== pubNub.getUUID()) {
          let lastMessage: IMessage;
          realm.write(() => {
            lastMessage = realm.create<IMessage>(
              'Message',
              {
                ...message,
                timetoken: String(timetoken),
                ...getBaseModelValues(),
              },
              Realm.UpdateMode.Modified,
            );
          });
          let conversation: IConversation = realm
            .objects<IConversation>('Conversation')
            .filtered(`channel = "${channel}"`)[0];
          if (!conversation) {
            const response = await pubNub.objects.getChannelMetadata({
              channel,
              include: {customFields: true},
            });
            conversation = await getConversationService().getConversationFromChannelMetadata(
              response.data,
            );
            realm.write(() => {
              if (conversation.type === '1-1') {
                const contact = realm
                  .objects<IContact>('Contact')
                  .filtered(`mobile = "${conversation.name}"`)[0];
                if (contact) {
                  conversation.name = contact.fullName;
                  contact.channel = conversation.channel;
                }
              }
              realm.create<IConversation>(
                'Conversation',
                {
                  ...conversation,
                  lastMessage,
                  ...getBaseModelValues(),
                },
                Realm.UpdateMode.Modified,
              );
            });
          } else {
            realm.write(() => {
              realm.create(
                'Conversation',
                {
                  channel,
                  lastMessage,
                  ...getBaseModelValues(),
                },
                Realm.UpdateMode.Modified,
              );
            });
          }
          retryPromise(() => {
            return new Promise<any>((resolve, reject) => {
              pubNub.addMessageAction(
                {
                  channel,
                  messageTimetoken: timetoken,
                  action: {type: 'receipt', value: 'message_delivered'},
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
          }).then((response) => {
            realm.write(() => {
              lastMessage.delivered_timetoken = String(response.timetoken);
            });
          });
        }
      } catch (e) {
        handleError(e);
      }
    });
  }, [handleError, pubNub, realm]);

  useEffect(() => {
    const pubNubService = getPubNubService();
    return pubNubService.addMessageActionEventListener(
      (evt: MessageActionEvent) => {
        try {
          if (
            evt.data.value === 'message_delivered' &&
            evt.publisher !== pubNub.getUUID()
          ) {
            const message = realm
              .objects<IMessage>('Message')
              .filtered(`timetoken = "${evt.data.messageTimetoken}"`)[0];
            if (message) {
              realm.write(() => {
                message.delivered_timetoken = evt.data.actionTimetoken;
              });
            }
          }
        } catch (e) {
          handleError(e);
        }
      },
    );
  }, [handleError, pubNub, realm]);
};

export * from './service';
