import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {getAuthService} from '../../../services';
import {useNavigation} from '@react-navigation/native';
import AppMenu from '../../../components/Menu';
import {applyStyles, decrypt, retryPromise} from '../../../helpers/utils';
import {IContact, IConversation, IMessage} from '../../../models';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../../../services/RealmService';
import {MessageEvent, SignalEvent} from 'pubnub';
import Realm from 'realm';
import CustomersTab from '../customers';
import BusinessTab from '../business';

type HomeTabParamList = {
  ChatList: undefined;
  Contacts: undefined;
  Customers: undefined;
  Business: undefined;
};

const HomeTab = createMaterialTopTabNavigator<HomeTabParamList>();

type ChannelMetadataCustomFields = {
  members: string;
  type: '1-1';
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const pubNub = usePubNub();
  const realm = useRealm();
  const handleLogout = useCallback(async () => {
    try {
      const authService = getAuthService();
      await authService.logOut();
      realm.write(() => {
        realm.deleteAll();
      });
      pubNub.unsubscribeAll();
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    } catch (e) {
      console.log('Error: ', e);
    }
  }, [realm, pubNub, navigation]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppMenu options={[{text: 'Log out', onSelect: handleLogout}]} />
      ),
    });
  }, [handleLogout, navigation]);

  useEffect(() => {
    const channelGroups: string[] = [pubNub.getUUID()];
    const channels: string[] = [];

    if (realm) {
      const conversations = realm.objects<IConversation>('Conversation');
      channels.push(
        ...conversations.map((conversation) => conversation.channel),
      );
    }

    pubNub.subscribe({channels, channelGroups});
    return () => {
      if (pubNub) {
        pubNub.unsubscribeAll();
      }
    };
  }, [pubNub, realm]);

  const extractMembers = (membersString: string) => {
    return membersString
      .split(',')
      .map((encryptedMember) => decrypt(encryptedMember));
  };

  useEffect(() => {
    const listener = {
      message: async (evt: MessageEvent) => {
        const {channel, publisher} = evt;
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
                  sent_timetoken: String(evt.timetoken),
                },
                Realm.UpdateMode.Modified,
              );
            });
            let conversation: any = realm
              .objects<IConversation>('Conversation')
              .filtered(`channel = "${channel}"`)[0];
            if (!conversation) {
              const response = await pubNub.objects.getChannelMetadata({
                channel,
                include: {customFields: true},
              });
              const customFields = response.data
                .custom as ChannelMetadataCustomFields;
              const members = extractMembers(customFields.members);
              const authService = getAuthService();
              const user = authService.getUser() as User;
              let sender = members.find(
                (member) => member !== user.mobile,
              ) as string;
              const contact = realm
                .objects<IContact>('Contact')
                .filtered(`mobile = "${sender}"`)[0];
              if (contact) {
                sender = contact.fullName;
              }
              realm.write(() => {
                if (contact) {
                  contact.channel = channel;
                }
                realm.create<IConversation>(
                  'Conversation',
                  {
                    title: sender,
                    channel,
                    lastMessage,
                    type: customFields.type,
                    members,
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
                pubNub.signal(
                  {channel, message: 'RECEIVED'},
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
                lastMessage.received_timetoken = String(response.timetoken);
              });
            });
          }
        } catch (e) {
          console.log('Message Listener Error: ', e.status || e);
        }
      },
      signal: (evt: SignalEvent) => {
        try {
          if (
            evt.message === 'RECEIVED' &&
            evt.publisher !== pubNub.getUUID()
          ) {
            const messages = realm
              .objects<IMessage>('Message')
              .filtered(
                `channel = "${evt.channel}" AND received_timetoken = null AND sent_timetoken != null`,
              );
            if (messages.length) {
              realm.write(() => {
                for (let i = 0; i < messages.length; i += 1) {
                  messages[i].received_timetoken = evt.timetoken;
                }
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
    const loadMemberships = async () => {
      try {
        const {data} = await pubNub.objects.getMemberships({
          uuid: pubNub.getUUID(),
          include: {
            customChannelFields: true,
          },
        });
        const conversations = data.map<IConversation>(({channel}) => {
          const custom = channel.custom as ChannelMetadataCustomFields;
          const members = extractMembers(custom.members);
          const user = getAuthService().getUser() as User;

          let sender: string;
          if (custom.type === '1-1') {
            sender = members.find((member) => member !== user.mobile) as string;
          } else {
            sender = channel.name ?? '';
          }
          return {
            title: sender,
            type: custom.type,
            members,
            channel: channel.id,
          };
        });
        realm.write(() => {
          conversations.forEach((conversation) => {
            let title: string = conversation.title;
            if (conversation.type === '1-1') {
              const contact = realm
                .objects<IContact>('Contact')
                .filtered(`mobile = "${conversation.title}"`)[0];
              if (contact) {
                title = contact.fullName;
              }
              if (contact) {
                contact.channel = conversation.channel;
              }
            }
            realm.create<IConversation>(
              'Conversation',
              {
                ...conversation,
                title,
              },
              Realm.UpdateMode.Modified,
            );
          });
        });
      } catch (e) {}
    };
    loadMemberships().then();
  }, [pubNub, realm]);

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

export default HomeScreen;
