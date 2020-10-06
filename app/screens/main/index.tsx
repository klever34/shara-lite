import {applyStyles} from '@/helpers/utils';
import {ICredit} from '@/models/Credit';
import {IPayment} from '@/models/Payment';
import {IReceipt} from '@/models/Receipt';
import {useCreditReminder} from '@/services/credit-reminder';
import {useErrorHandler} from '@/services/error-boundary';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {
  getAnalyticsService,
  getAuthService,
  getPubNubService,
} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import {ReportsScreen} from './reports';
import CreditPayment from './customers/CreditPayment';
import {CustomerCreditPaymentDetails} from './customers/CreditPaymentDetails';
import {CustomerCreditDetails} from './customers/CustomerCreditDetails';
import CustomerDetails from './customers/CustomerDetails';
import {CustomerOverdueCredit} from './customers/CustomerOverdueCredit';
import {CustomerTotalCredit} from './customers/CustomerTotalCredit';
import OrderDetails from './customers/OrderDetails';
import PaymentDetails from './customers/PaymentDetails';
import RecordPayment from './customers/RecordPayment';
import {SalesDetails} from './home';
import HomeScreen from './HomeScreen';
import {AddCustomer, CustomersScreen} from '@/screens/main/customers';
import {BusinessSettings, UserProfileSettings} from './settings';
import {ICustomer} from '@/models';
import {useRepeatBackToExit} from '@/services/navigation';

export type MainStackParamList = {
  Home: undefined;
  CustomerDetails: {customer: ICustomer};
  CustomerRecordCreditPayment: undefined;
  CustomerCreditPayment: {creditDetails: ICredit};
  CustomerPaymentDetails: {payment: IPayment};
  CustomerOrderDetails: {order: any};
  CustomerTotalCredit: {credits: ICredit[]};
  CustomerCreditPaymentDetails: {creditPaymentDetails: IPayment};
  CustomerOverdueCredit: {credits: ICredit[]};
  CustomerCreditDetails: {creditDetails: ICredit};
  BusinessSettings: undefined;
  Reports: undefined;
  Customers: undefined;
  AddCustomer: undefined;
  UserProfileSettings: undefined;
  SalesDetails: {id: IReceipt['_id']};
};

const MainStack = createStackNavigator<MainStackParamList>();

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
          name="CustomerRecordCreditPayment"
          component={RecordPayment}
          options={{
            title: 'Record Payment',
          }}
        />
        <MainStack.Screen
          name="CustomerCreditPayment"
          component={CreditPayment}
          options={{
            title: 'Credit Payment',
          }}
        />
        <MainStack.Screen
          name="CustomerPaymentDetails"
          component={PaymentDetails}
          options={{
            title: 'Payment Details',
          }}
        />
        <MainStack.Screen
          name="CustomerOrderDetails"
          component={OrderDetails}
          options={{
            title: 'Order Details',
          }}
        />
        <MainStack.Screen
          name="Customers"
          component={CustomersScreen}
          options={{
            title: 'My Customers',
          }}
        />
        <MainStack.Screen
          name="CustomerTotalCredit"
          component={CustomerTotalCredit}
          options={{
            title: 'Total Credit',
          }}
        />
        <MainStack.Screen
          name="CustomerOverdueCredit"
          component={CustomerOverdueCredit}
          options={{
            title: 'Overdue Credit',
          }}
        />
        <MainStack.Screen
          name="CustomerCreditDetails"
          component={CustomerCreditDetails}
          options={{
            title: 'Credit Payment',
          }}
        />
        <MainStack.Screen
          name="CustomerCreditPaymentDetails"
          component={CustomerCreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
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
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

export default MainScreens;
