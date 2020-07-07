import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {getAuthService} from '../../../services';
import {useNavigation} from '@react-navigation/native';
import AppMenu from '../../../components/Menu';
import {applyStyles} from '../../../helpers/utils';
import {IContact, IConversation, IMessage} from '../../../models';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../../../services/realm';
import {MessageEvent} from 'pubnub';
import Realm from 'realm';
import '../../../../shim';
import Cryptr from 'cryptr';
import Config from 'react-native-config';
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
    const authService = getAuthService();
    await authService.logOut();
    navigation.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
    // Realm.deleteFile({});
  }, [navigation]);
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

  useEffect(() => {
    if (pubNub) {
      const listener = {
        message: (envelope: MessageEvent) => {
          const {channel} = envelope;
          const message = envelope.message as IMessage;
          try {
            let lastMessage: IMessage;
            realm.write(() => {
              lastMessage = realm.create<IMessage>(
                'Message',
                {
                  ...message,
                  created_at: new Date(message.created_at),
                  timetoken: envelope.timetoken,
                },
                Realm.UpdateMode.Modified,
              );
            });
            realm.write(() => {
              let conversation: any = realm
                .objects<IConversation>('Conversation')
                .filtered(`channel = "${channel}"`)[0];
              if (!conversation) {
                pubNub.objects
                  .getMemberships({
                    uuid: pubNub.getUUID(),
                    include: {customFields: true},
                  })
                  .then((response) => {
                    const cryptr = new Cryptr(Config.PUBNUB_USER_CRYPT_KEY);
                    const channelMembership = response.data.find(
                      (membership) => {
                        return membership.channel.id === channel;
                      },
                    );
                    if (!channelMembership || !channelMembership.custom) {
                      return;
                    }
                    const encryptedMember = channelMembership.custom.mobile;
                    let sender = cryptr.decrypt(String(encryptedMember));
                    const contact = realm
                      .objects<IContact>('Contact')
                      .filtered(`mobile = "${sender}"`)[0];
                    if (contact) {
                      sender = contact.fullName;
                    }
                    realm.create<IConversation>(
                      'Conversation',
                      {
                        title: sender,
                        channel,
                        lastMessage,
                      },
                      Realm.UpdateMode.Never,
                    );
                  })
                  .catch((e) => {
                    console.log('Error :', e.status);
                  });
              } else {
                realm.create<IConversation>(
                  'Conversation',
                  {
                    channel,
                    lastMessage,
                  },
                  Realm.UpdateMode.Modified,
                );
              }
            });
          } catch (e) {
            console.log('Error: ', e);
          }
        },
      };
      pubNub.addListener(listener);
      return () => {
        pubNub.removeListener(listener);
      };
    }
  }, [pubNub, realm]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <HomeTab.Navigator
        initialRouteName="ChatList"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.primary},
          indicatorStyle: {backgroundColor: colors.white},
          labelStyle: {fontWeight: 'bold'},
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
