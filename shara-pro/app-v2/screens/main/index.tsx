import EmptyState from 'app-v2/components/EmptyState';
import {applyStyles} from 'app-v2/helpers/utils';
import {ICustomer} from 'app-v2/models';
import {IReceipt} from 'app-v2/models/Receipt';
import {AddCustomer, CustomersScreen} from 'app-v2/screens/main/customers';
import {useCreditReminder} from 'app-v2/services/credit-reminder';
import {useRepeatBackToExit} from 'app-v2/services/navigation';
import {useRealm} from 'app-v2/services/realm';
import {RealmContext} from 'app-v2/services/realm/provider';
import {colors} from 'app-v2/styles';
import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {getAuthService, getPubNubService} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import CustomerDetails from './customers/CustomerDetails';
import {SalesDetails} from './home';
import HomeScreen from './HomeScreen';
import {ManageItems} from './items';
import {ReportsScreen} from './reports';
import {BusinessSettings, UserProfileSettings} from './settings';

export type MainStackParamList = {
  Home: undefined;
  CustomerDetails: {customer: ICustomer};
  BusinessSettings: undefined;
  Reports: undefined;
  Customers: undefined;
  AddCustomer: undefined;
  UserProfileSettings: undefined;
  SalesDetails: {receipt: IReceipt};
  ManageItems: undefined;
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
          name="AddCustomer"
          component={AddCustomer}
          options={{
            title: 'Add Customer',
          }}
        />
        <MainStack.Screen
          name="CustomerDetails"
          component={CustomerDetails}
          options={({route}) => ({
            title: route.params.customer.name,
          })}
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
          name="UserProfileSettings"
          component={UserProfileSettings}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="SalesDetails"
          component={SalesDetails}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="ManageItems"
          component={ManageItems}
          options={{title: 'Manage Items'}}
        />
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

export default MainScreens;
