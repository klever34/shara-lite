import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState, useCallback} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import Config from 'react-native-config';
import {getStorageService, getPushNotificationService} from '../../services';
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

  const onRegister = useCallback(
    (token: PushNotificationToken) => {
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
    [pubnubInstance],
  );

  const onNotification = useCallback(
    (notification: PushNotificationData) => {
      console.log('NOTIFICATION:', notification);
      navigation && navigation.navigate('Chat');
    },
    [navigation],
  );

  useEffect(() => {
    const storageService = getStorageService();
    storageService.getItem<User>('user').then((user) => {
      if (user) {
        const pubnub = new PubNub({
          subscribeKey: Config.PUBNUB_SUB_KEY,
          publishKey: Config.PUBNUB_PUB_KEY,
          uuid: user.mobile,
        });
        getPushNotificationService(onRegister, onNotification);
        setPubnubInstance(pubnub);
      }
    });
  }, [onNotification, onRegister]);

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
