import EmptyState from '@/components/EmptyState';
import {useCreditReminder} from '@/services/credit-reminder';
import {useRepeatBackToExit} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {RealmContext} from '@/services/realm/provider';
import {colors} from '@/styles';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {getAuthService, getPubNubService} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import {applyStyles} from '@/styles';
import {HomeScreen} from '@/screens/main/HomeScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {
  BusinessSettings,
  UserProfileSettings,
} from '@/screens/main/more/settings';
import {ReportsScreen} from '@/screens/main/more/reports';
import {ReceiptDetailsScreen} from './receipts/ReceiptDetailsScreen';
import {IReceipt} from '@/models/Receipt';

export type MainStackParamList = {
  Home: undefined;

  // Receipt
  ReceiptDetails: {id: IReceipt['_id']};

  // More
  UserProfileSettings: undefined;
  BusinessSettings: undefined;
  Reports: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = () => {
  useRepeatBackToExit();
  const realm = useRealm();
  const {isSyncCompleted} = useContext(RealmContext);

  useRealmSyncLoader();
  useCreditReminder();

  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);

  useEffect(() => {
    const user = getAuthService().getUser();
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
  }, []);

  if (!realm) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  if (!isSyncCompleted) {
    return (
      <EmptyState
        heading={'Sync in progress'}
        text={
          'We are syncing your data across the Shara app. This might take a few seconds.'
        }
        source={require('../../assets/images/coming-soon.png')}>
        <View style={applyStyles('mt-lg')}>
          <ActivityIndicator color={colors.primary} size={40} />
        </View>
      </EmptyState>
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
            fontFamily: 'Roboto-Regular',
          },
          headerTintColor: colors['gray-300'],
        }}>
        {/* Home */}
        <MainStack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />

        {/* More */}
        <MainStack.Screen
          name="BusinessSettings"
          component={BusinessSettings}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="UserProfileSettings"
          component={UserProfileSettings}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="ReceiptDetails"
          component={ReceiptDetailsScreen}
          options={{headerShown: false}}
        />
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

export default MainScreens;
