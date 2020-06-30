import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Config from 'react-native-config';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import StorageService from '../../services/StorageService';
import {colors} from '../../styles';
import HomeScreen from './home';
import ChatScreen from './ChatScreen';
import ContactsScreen from './ContactsScreen';
import {getStorageService} from '../../services';

export type MainStackParamList = {
  Home: undefined;
  Chat: {title: string};
  Contacts: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = () => {
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
        setPubnubInstance(pubnub);
      }
    });
  }, []);
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
