import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import Config from 'react-native-config';
import PushNotification from 'react-native-push-notification';
import {
  getAuthService,
  getContactsService,
  getRealmService,
} from '../../services';
import {colors} from '../../styles';
import ChatScreen from './ChatScreen';
import ContactsScreen from './ContactsScreen';
import HomeScreen from './home';
import Realm from 'realm';
import {createRealm, RealmProvider} from '../../services/RealmService';
import getUuidByString from 'uuid-by-string';
import Receipts from './business/Receipts';
import NewReceipt from './business/NewReceipt';
import ReceiptSummary from './business/ReceiptSummary';
import StatusModal from './StatusModal';
import Finances from './business/Finances';
import Inventory from './business/Inventory';
import Expenses from './business/Expenses';
import Credit from './business/Credit';

export type MainStackParamList = {
  Home: undefined;
  Chat: {title: string; channel: string};
  Contacts: undefined;
  Receipts: undefined;
  NewReceipt: {customer: Customer};
  ReceiptSummary: {customer: Customer; products: ReceiptItem[]};
  StatusModal: {status: string; text: string; onClick(): void};
  Finances: undefined;
  Inventory: undefined;
  Expenses: undefined;
  Credit: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = ({navigation}: any) => {
  const channelName = 'SHARA_GLOBAL';
  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);
  const [realm, setRealm] = useState<Realm | null>(null);
  useEffect(() => {
    createRealm().then((nextRealm) => {
      setRealm(nextRealm);
      const realmService = getRealmService();
      realmService.setInstance(nextRealm);
    });
  }, []);
  useEffect(() => {
    const authService = getAuthService();
    const user = authService.getUser();
    if (user) {
      const pubNub = new PubNub({
        subscribeKey: Config.PUBNUB_SUB_KEY,
        publishKey: Config.PUBNUB_PUB_KEY,
        uuid: getUuidByString(user.mobile),
      });
      setPubNubClient(pubNub);
    }
  }, []);

  useEffect(() => {
    const contactsService = getContactsService();
    contactsService.loadContacts().catch((error) => {
      Alert.alert(
        'Error',
        error.message,
        [
          {
            text: 'OK',
          },
        ],
        {
          cancelable: false,
        },
      );
    });
  }, [navigation]);

  useEffect(() => {
    PushNotification.configure({
      onRegister: (token: PushNotificationToken) => {
        if (pubNubClient) {
          if (token.os === 'ios') {
            pubNubClient.push.addChannels({
              channels: [channelName],
              device: token.token,
              pushGateway: 'apns',
            });
          } else if (token.os === 'android') {
            pubNubClient.push.addChannels({
              channels: [channelName],
              device: token.token,
              pushGateway: 'gcm',
            });
          }
        }
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: () => {
        navigation.navigate('Chat', {title: 'Shara Chat'});
        PushNotification.cancelAllLocalNotifications();
      },
    });
  }, [navigation, pubNubClient]);

  if (!pubNubClient || !realm) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }
  return (
    <RealmProvider value={realm}>
      <PubNubProvider client={pubNubClient}>
        <MainStack.Navigator initialRouteName="Home">
          <MainStack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Shara',
              headerStyle: {
                elevation: 0,
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontFamily: 'CocogoosePro-Regular',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="Contacts"
            component={ContactsScreen}
            options={{
              title: 'Select Contact',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="Receipts"
            component={Receipts}
            options={{
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="NewReceipt"
            component={NewReceipt}
            options={{
              title: 'New Receipt',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="ReceiptSummary"
            component={ReceiptSummary}
            options={{
              title: 'Receipt Summary',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="StatusModal"
            component={StatusModal}
            options={{headerShown: false}}
          />
          <MainStack.Screen
            name="Finances"
            component={Finances}
            options={{
              title: 'Finances',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="Inventory"
            component={Inventory}
            options={{
              title: 'Inventory',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="Expenses"
            component={Expenses}
            options={{
              title: 'Expenses',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
          <MainStack.Screen
            name="Credit"
            component={Credit}
            options={{
              title: 'Credit',
              headerStyle: {
                backgroundColor: colors.primary,
              },
              headerTitleStyle: {
                fontSize: 16,
                fontFamily: 'CocogoosePro-SemiLight',
              },
              headerTintColor: '#fff',
            }}
          />
        </MainStack.Navigator>
      </PubNubProvider>
    </RealmProvider>
  );
};

const styles = StyleSheet.create({
  activityIndicatorContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainScreens;
