import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {colors} from '../../../styles';
import ChatListScreen from './ChatListScreen';
import {getAuthService} from '../../../services';
import {useNavigation} from '@react-navigation/native';
import AppMenu from '../../../components/Menu';
import {applyStyles} from '../../../helpers/utils';
import {IConversation, IMessage} from '../../../models';
import {usePubNub} from 'pubnub-react';
import {useRealm} from '../../../services/realm';
import {MessageEvent} from 'pubnub';
import {UpdateMode} from 'realm';
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
  const handleLogout = useCallback(async () => {
    const authService = getAuthService();
    await authService.logOut();
    navigation.reset({
      index: 0,
      routes: [{name: 'Auth'}],
    });
  }, [navigation]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppMenu options={[{text: 'Log out', onSelect: handleLogout}]} />
      ),
    });
  }, [handleLogout, navigation]);

  const pubNub = usePubNub();
  const realm = useRealm();

  useEffect(() => {
    if (pubNub) {
      const channels: string[] = [pubNub.getUUID()];

      if (realm) {
        const conversations = realm.objects<IConversation>('Conversation');
        channels.push(
          ...conversations.map((conversation) => conversation.channel),
        );
      }

      pubNub.subscribe({channels});
    }
    return () => {
      if (pubNub) {
        pubNub.unsubscribeAll();
      }
    };
  }, [pubNub, realm]);

  useEffect(() => {
    if (pubNub) {
      const listener = {
        message: (envelope: MessageEvent & {message: IMessage}) => {
          const {channel} = envelope;
          const message = envelope.message as IMessage;
          try {
            realm.write(() => {
              const lastMessage = realm.create<IMessage>(
                'Message',
                {
                  ...message,
                  created_at: new Date(message.created_at),
                  timetoken: envelope.timetoken,
                },
                UpdateMode.Modified,
              );
              realm.create<IConversation>(
                'Conversation',
                {
                  // TODO: Use User full Name as title
                  title: envelope.message.author,
                  channel,
                  lastMessage,
                },
                UpdateMode.Modified,
              );
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
