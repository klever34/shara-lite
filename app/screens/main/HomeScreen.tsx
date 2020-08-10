import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import {MessageEvent} from 'pubnub';
import {usePubNub} from 'pubnub-react';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, Platform, SafeAreaView, View} from 'react-native';
import PushNotification from 'react-native-push-notification';
import Realm from 'realm';
import {PushNotificationToken} from '../../../types/app';
import {MessageActionEvent} from '../../../types/pubnub';
import HeaderRight from '../../components/HeaderRight';
import {ModalWrapperFields, withModal} from '../../helpers/hocs';
import {applyStyles, retryPromise} from '../../helpers/utils';
import {IContact, IConversation, IMessage} from '../../models';
import {getAuthService, getRealmService} from '../../services';
import {useRealm} from '../../services/realm';
import {colors} from '../../styles';
import {BusinessTab} from './business';
import ChatListScreen from './chat/ChatListScreen';
import CustomersTab from './customers';
import Touchable from '../../components/Touchable';
import Icon from '../../components/Icon';
import {useScreenRecord} from '../../services/analytics';

type HomeTabParamList = {
  ChatList: undefined;
  Customers: undefined;
  Business: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

const HomeScreen = ({openModal}: ModalWrapperFields) => {
  useScreenRecord();
  const realm = useRealm();
  const pubNub = usePubNub();
  const navigation = useNavigation();
  const handleError = useErrorHandler();
  const [notificationToken, setNotificationToken] = useState('');

  const handleLogout = useCallback(async () => {
    try {
      const authService = getAuthService();
      await authService.logOut();
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    } catch (e) {
      handleError(e);
    }
  }, [handleError, navigation]);

  const restoreAllMessages = useCallback(async () => {
    const closeModal = openModal('loading', {text: 'Restoring messages...'});
    try {
      const realmService = getRealmService();
      await realmService.restoreAllMessages();
    } catch (e) {
      handleError(e);
    }
    closeModal();
  }, [handleError, openModal]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={applyStyles('flex-row flex-1 items-center')}>
          <Touchable onPress={() => {}}>
            <View style={applyStyles('px-xs', {width: '33%'})}>
              <Icon
                size={24}
                name="sliders"
                type="feathericons"
                color={colors.white}
              />
            </View>
          </Touchable>
          <Touchable onPress={() => {}}>
            <View style={applyStyles('px-xs', {width: '33%'})}>
              <Icon
                size={24}
                name="search"
                type="feathericons"
                color={colors.white}
              />
            </View>
          </Touchable>
          <HeaderRight
            menuOptions={[
              {
                text: 'Restore Messages',
                onSelect: () => {
                  Alert.alert('Backup Restore', 'Restore all your messages?', [
                    {
                      text: 'CANCEL',
                    },
                    {
                      text: 'OK',
                      onPress: restoreAllMessages,
                    },
                  ]);
                },
              },
              {
                text: 'Log out',
                onSelect: () => {
                  Alert.alert('Log Out', 'Are you sure you want to log out?', [
                    {
                      text: 'CANCEL',
                    },
                    {
                      text: 'OK',
                      onPress: handleLogout,
                    },
                  ]);
                },
              },
            ]}
          />
        </View>
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
      try {
        new Promise<any>((resolve, reject) => {
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
        }).then();
      } catch (e) {
        handleError(e);
      }
    }

    return () => {
      if (pubNub) {
        pubNub.unsubscribeAll();
      }
    };
  }, [handleError, notificationToken, pubNub, realm]);

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
          handleError(e);
        }
      },
    };
    pubNub.addListener(listener);
    return () => {
      pubNub.removeListener(listener);
    };
  }, [handleError, pubNub, realm]);

  useEffect(() => {
    const realmService = getRealmService();
    realmService.restoreAllConversations().catch(handleError);
  }, [handleError, openModal, pubNub, realm, restoreAllMessages]);

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
