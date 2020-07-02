import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Config from 'react-native-config';
import PushNotification from 'react-native-push-notification';
import {getStorageService} from '../../services';
import {colors} from '../../styles';
import ChatScreen from './ChatScreen';
import ContactsScreen from './ContactsScreen';
import HomeScreen from './home';

export type MainStackParamList = {
  Home: undefined;
  Chat: {title: string};
  Contacts: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = ({navigation}: any) => {
  const channelName = 'NOTIFICATION';
  const [pubnubInstance, setPubnubInstance] = useState<any>(null);

  useEffect(() => {
    const storageService = getStorageService();
    storageService.getItem<User>('user').then((user) => {
      if (user) {
        const pubnub = new PubNub({
          subscribeKey: Config.PUBNUB_SUB_KEY,
          publishKey: Config.PUBNUB_PUB_KEY,
          uuid: user.mobile,
        });
        PushNotification.configure({
          onRegister: function (token: any) {
            console.log('TOKEN:', token);
            if (token.os === 'ios') {
              pubnub.push.addChannels({
                channels: [channelName],
                device: token.token,
                pushGateway: 'apns',
              });
            } else if (token.os === 'android') {
              pubnub.push.addChannels({
                channels: [channelName],
                device: token.token,
                pushGateway: 'gcm',
              });
            }
          },
          onNotification: function (notification: any) {
            console.log('NOTIFICATION:', notification);
            navigation.navigate('Chat');
            // Do something with the notification.
          },
          senderID: Config.FIREBASE_SENDER_ID,
        });
        setPubnubInstance(pubnub);
      }
    });
  }, [navigation]);
  if (!pubnubInstance) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }
  return (
    <PubNubProvider client={pubnubInstance}>
      <MainStack.Navigator initialRouteName="Home">
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
