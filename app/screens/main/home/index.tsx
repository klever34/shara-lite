import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {Alert, Platform, SafeAreaView} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {getAuthService, getRealmService} from '../../../services';
import {useNavigation} from '@react-navigation/native';
import AppMenu from '../../../components/Menu';
import {applyStyles, retryPromise} from '../../../helpers/utils';
import {IContact, IConversation, IMessage} from '../../../models';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../../../services/realm';
import {MessageEvent} from 'pubnub';
import Realm from 'realm';
import CustomersTab from '../customers';
import BusinessTab from '../business';
import PushNotification from 'react-native-push-notification';
import {ModalWrapperFields, withModal} from '../../../helpers/hocs';
import {MessageActionEvent} from '../../../../types/pubnub';

type HomeTabParamList = {
  ChatList: undefined;
  Contacts: undefined;
  Customers: undefined;
  Business: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

const HomeScreen = ({openModal}: ModalWrapperFields) => {
  const navigation = useNavigation();
  const pubNub = usePubNub();
  const realm = useRealm();
  const [notificationToken, setNotificationToken] = useState('');
  const handleLogout = useCallback(async () => {
    try {
      const authService = getAuthService();
      await authService.logOut();
      const realmService = getRealmService();
      realmService.clearRealm();
    } catch (e) {
      console.log('Error: ', e);
    }
  }, []);

  const restoreAllMessages = useCallback(async () => {
    const closeModal = openModal('Restoring messages...');
    try {
      const realmService = getRealmService();
      await realmService.restoreAllMessages();
    } catch (e) {
      console.log('Error: ', e);
    }
    closeModal();
  }, [openModal]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppMenu
          options={[
            {
              text: 'Restore Messages',
              onSelect: () => {
                Alert.alert('Backup Restore', 'Restore all your messages?', [
                  {
                    text: 'OK',
                    onPress: restoreAllMessages,
                  },
                  {
                    text: 'CANCEL',
                  },
                ]);
              },
            },
            {text: 'Log out', onSelect: handleLogout},
          ]}
        />
      ),
    });
  }, [handleLogout, navigation, restoreAllMessages]);

  useEffect(() => {
    const channelGroups: string[] = [pubNub.getUUID()];
    const channels: string[] = [];

    const conversations = realm.objects<IConversation>('Conversation');
    channels.push(...conversations.map((conversation) => conversation.channel));

    pubNub.subscribe({channels, channelGroups});

    const pushGateway = Platform.select({android: 'gcm', ios: 'apns'});
    if (pushGateway && notificationToken) {
      pubNub.push.addChannels(
        {
          channels: [...channels, pubNub.getUUID()],
          device: notificationToken,
          pushGateway,
        },
        (status) => {
          if (status.error) {
            console.log('PubNub Error: ', status);
          }
        },
      );
    }

    return () => {
      if (pubNub) {
        pubNub.unsubscribeAll();
      }
    };
  }, [notificationToken, pubNub, realm]);

  useEffect(() => {
    PushNotification.configure({
      onRegister: (token: PushNotificationToken) => {
        setNotificationToken(token.token);
      },
      onNotification: (notification: any) => {
        if (!notification.foreground) {
          const conversation = realm
            .objects<IConversation>('Conversation')
            .filtered(`channel = "${notification.channel}"`)[0];
          navigation.navigate('Chat', conversation);
          PushNotification.cancelAllLocalNotifications();
        }
      },
    });
  }, [navigation, realm]);

  useEffect(() => {
    const listener = {
      message: async (evt: MessageEvent) => {
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
                  created_at: new Date(message.created_at),
                  timetoken: String(timetoken),
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
              const realmService = getRealmService();
              conversation = await realmService.getConversationFromChannelMetadata(
                response.data,
              );
              realm.write(() => {
                if (conversation.type === '1-1') {
                  const contact = realm
                    .objects<IContact>('Contact')
                    .filtered(`mobile = "${conversation.title}"`)[0];
                  if (contact) {
                    conversation.title = contact.fullName;
                    contact.channel = conversation.channel;
                  }
                }
                realm.create<IConversation>(
                  'Conversation',
                  {
                    ...conversation,
                    lastMessage,
                  },
                  Realm.UpdateMode.Modified,
                );
              });
            } else {
              realm.write(() => {
                realm.create<IConversation>(
                  'Conversation',
                  {
                    channel,
                    lastMessage,
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
                      console.log('RECEIVED Signal Error: ', status);
                      reject(status.errorData);
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
          console.log('Message Listener Error: ', e.status || e);
        }
      },
      messageAction: (evt: MessageActionEvent) => {
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
          console.log('Signal Listener Error: ', e);
        }
      },
    };
    pubNub.addListener(listener);
    return () => {
      pubNub.removeListener(listener);
    };
  }, [pubNub, realm]);

  useEffect(() => {
    const realmService = getRealmService();
    realmService.restoreAllConversations().catch((e) => {
      console.log('Error: ', e);
    });
  }, [openModal, pubNub, realm, restoreAllMessages]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <HomeTab.Navigator
        initialRouteName="ChatList"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.primary},
          indicatorStyle: {backgroundColor: colors.white},
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: 'rgba(255,255,255, 1)',
          inactiveTintColor: 'rgba(255,255,255, 0.75)',
        }}>
        <HomeTab.Screen
          name="ChatList"
          options={{title: 'Chat'}}
          component={ChatListScreen}
        />
        <HomeTab.Screen
          name="Customers"
          component={CustomersTab}
          options={{title: 'My Customers'}}
        />
        <HomeTab.Screen
          name="Business"
          component={BusinessTab}
          options={{title: 'My Business'}}
        />
      </HomeTab.Navigator>
    </SafeAreaView>
  );
};

export default withModal(HomeScreen);
