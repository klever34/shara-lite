import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Config from 'react-native-config';
import PushNotification from 'react-native-push-notification';
import {getAuthService} from '../../services';
import {colors} from '../../styles';
import ChatScreen from './ChatScreen';
import ContactsScreen from './ContactsScreen';
import HomeScreen from './home';
import Receipts from './business/Receipts';
import NewReceipt from './business/NewReceipt';
import ReceiptSummary from './business/ReceiptSummary';
import StatusModal from './StatusModal';

export type MainStackParamList = {
  Home: undefined;
  Chat: {title: string};
  Contacts: undefined;
  Receipts: undefined;
  NewReceipt: undefined;
  ReceiptSummary: undefined;
  StatusModal: {status: string; text: string; onClick(): void};
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = ({navigation}: any) => {
  const channelName = 'SHARA_GLOBAL';
  const [pubnubInstance, setPubnubInstance] = useState<any>(null);

  useEffect(() => {
    const authService = getAuthService();
    const user = authService.getUser();
    if (user) {
      const pubnub = new PubNub({
        subscribeKey: Config.PUBNUB_SUB_KEY,
        publishKey: Config.PUBNUB_PUB_KEY,
        uuid: user.mobile,
      });
      setPubnubInstance(pubnub);
    }
  }, []);

  useEffect(() => {
    PushNotification.configure({
      onRegister: (token: PushNotificationToken) => {
        if (pubnubInstance) {
          if (token.os === 'ios') {
            pubnubInstance.push.addChannels({
              channels: [channelName],
              device: token.token,
              pushGateway: 'apns',
            });
          } else if (token.os === 'android') {
            pubnubInstance.push.addChannels({
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
  }, [navigation, pubnubInstance]);

  if (!pubnubInstance) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  return (
    <PubNubProvider client={pubnubInstance}>
      <MainStack.Navigator mode="modal" initialRouteName="Home">
        <MainStack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Shara',
            headerStyle: {
              backgroundColor: colors.primary,
              elevation: 0,
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
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="StatusModal"
          component={StatusModal}
          options={{headerShown: false}}
        />
      </MainStack.Navigator>
    </PubNubProvider>
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
