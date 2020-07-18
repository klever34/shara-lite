import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {getApiService, getAuthService} from '../../../services';
import {useNavigation} from '@react-navigation/native';
import AppMenu from '../../../components/Menu';
import {applyStyles, decrypt, retryPromise} from '../../../helpers/utils';
import {IContact, IConversation, IMessage} from '../../../models';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../../../services/RealmService';
import PubNub, {MessageEvent, SignalEvent} from 'pubnub';
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

  const getConversationFromChannelMetadata = async (
    channelMetadata: PubNub.ChannelMetadataObject<PubNub.ObjectCustom>,
  ): Promise<IConversation> => {
    try {
      const custom = channelMetadata.custom as ChannelCustom;
      let sender: string;
      let members: string[];
      if (custom.type === 'group') {
        const apiService = getApiService();
        const groupChatMembers = await apiService.getGroupMembers(custom.id);
        members = groupChatMembers.map(({user: {mobile}}) => mobile);
        sender = channelMetadata.name ?? '';
      } else {
        members = custom.members
          .split(',')
          .map((encryptedMember) => decrypt(encryptedMember));
        const user = getAuthService().getUser() as User;
        sender = members.find((member) => member !== user.mobile) ?? '';
      }
      return {
        title: sender,
        type: custom.type ?? '1-1',
        members,
        channel: channelMetadata.id,
      };
    } catch (e) {
      console.log('getConversationFromChannelMetadata Error: ', e);
      throw e;
    }
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
            let conversation: IConversation = realm
              .objects<IConversation>('Conversation')
              .filtered(`channel = "${channel}"`)[0];
            if (!conversation) {
              const response = await pubNub.objects.getChannelMetadata({
                channel,
                include: {customFields: true},
              });
              conversation = await getConversationFromChannelMetadata(
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
    (async () => {
      try {
        const {data} = await pubNub.objects.getMemberships({
          uuid: pubNub.getUUID(),
          include: {
            customChannelFields: true,
          },
        });
        const conversations: IConversation[] = [];
        for (let i = 0; i < data.length; i += 1) {
          const {channel} = data[i];
          const conversation = await getConversationFromChannelMetadata(
            channel,
          );
          conversations.push(conversation);
        }
        realm.write(() => {
          for (let i = 0; i < conversations.length; i += 1) {
            const conversation = conversations[i];
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
              conversation,
              Realm.UpdateMode.Modified,
            );
          }
        });
      } catch (e) {
        console.log('Error: ', e);
        throw e;
      }
    })().then();
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
