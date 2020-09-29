import {applyStyles} from '@/helpers/utils';
import {useCreditReminder} from '@/services/credit-reminder';
import {useErrorHandler} from '@/services/error-boundary';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {useNavigationState} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, BackHandler, ToastAndroid, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {
  getAnalyticsService,
  getAuthService,
  getPubNubService,
} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import {ReportsScreen} from './reports';
import HomeScreen from './HomeScreen';
import {CustomersScreen, AddCustomer} from '@/screens/main/customers';
import {BusinessSettings} from './settings';

export type MainStackParamList = {
  Home: undefined;
  BusinessSettings: undefined;
  Reports: undefined;
  Customers: undefined;
  AddCustomer: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const useRepeatBackToExit = () => {
  const [backClickCount, setBackClickCount] = useState<0 | 1>(0);
  const navigationState = useNavigationState((state) => state);
  const spring = useCallback(() => {
    const duration = 1500;
    setBackClickCount(1);
    ToastAndroid.show('Press BACK again to exit', duration);
    setTimeout(() => {
      setBackClickCount(0);
    }, duration);
  }, []);
  const handleBackButton = useCallback(() => {
    const mainRoute = navigationState.routes[0];
    if (mainRoute.state) {
      if (mainRoute.state.routes.length !== 1) {
        return false;
      }
      if (mainRoute.state.routes[0].name === 'Home') {
        const homeRoute = mainRoute.state.routes[0];
        if (homeRoute.state) {
          if (homeRoute.state.index !== 0) {
            return false;
          }
        }
      }
    }
    if (backClickCount === 1) {
      BackHandler.exitApp();
    } else {
      spring();
    }
    return true;
  }, [backClickCount, navigationState.routes, spring]);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, [handleBackButton]);
};

const MainScreens = () => {
  useRepeatBackToExit();
  const handleError = useErrorHandler();
  const realm = useRealm();
  const user = getAuthService().getUser();

  useRealmSyncLoader();
  useCreditReminder();

  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);

  useEffect(() => {
    if (user) {
      getAnalyticsService().setUser(user).catch(handleError);
    }
  }, [handleError, user]);

  useEffect(() => {
    if (user) {
      const pubNub = new PubNub({
        subscribeKey: Config.PUBNUB_SUB_KEY,
        publishKey: Config.PUBNUB_PUB_KEY,
        uuid: getUuidByString(user.mobile),
      });
      const pubNubService = getPubNubService();
      pubNubService.setInstance(pubNub);
      setPubNubClient(pubNub);
    }
  }, [user]);

  if (!realm) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  if (!pubNubClient) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  return (
    <PubNubProvider client={pubNubClient}>
      <MainStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTitleStyle: {
            fontSize: 16,
            fontFamily: 'CocogoosePro-SemiLight',
          },
          headerTintColor: colors['gray-300'],
        }}>
        <MainStack.Screen name="Home" component={HomeScreen} />
        <MainStack.Screen
          name="BusinessSettings"
          component={BusinessSettings}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="Customers"
          component={CustomersScreen}
          options={{
            title: 'My Customers',
          }}
        />
        <MainStack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Reports',
          }}
        />
        <MainStack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={{
            title: 'Add Customer',
          }}
        />
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

export default MainScreens;
