import EmptyState from '@/components/EmptyState';
import {IProduct} from '@/models/Product';
import {IReceipt} from '@/models/Receipt';
import {HomeScreen} from '@/screens/main/HomeScreen';
import {ReportsScreen} from '@/screens/main/more/reports';
import {
  BusinessSettings,
  UserProfileSettings,
} from '@/screens/main/more/settings';
import {useCreditReminder} from '@/services/credit-reminder';
import {useRepeatBackToExit} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {RealmContext} from '@/services/realm/provider';
import {applyStyles, colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {getAuthService, getPubNubService} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import {AddInventoryScreen} from './products/AddInventoryScreen';
import {CreateProductScreen} from './products/CreateProductScreen';
import {InventoryOtherDetailsScreen} from './products/InventoryOtherDetailsScreen';
import {CreateReceiptScreen} from './receipts/CreateReceiptScreen';
import {ReceiptDetailsScreen} from './receipts/ReceiptDetailsScreen';
import {AddCustomer} from '@/screens/main/customers';
import {ICustomer} from '@/models';
import CustomerDetails from '@/screens/main/customers/CustomerDetails';
import {ReceiptOtherDetailsScreen} from './receipts/ReceiptOtherDetailsScreen';
import {ReceiptProvider} from './receipts/ReceiptProvider';
import {ReceiptSuccessScreen} from './receipts/ReceiptSuccessScreen';
import {BuildReceiptScreen} from './receipts/BuildReceiptScreen';

export type MainStackParamList = {
  Home: undefined;

  // Customers
  AddCustomer: undefined;
  CustomerDetails: {customer: ICustomer};

  // Receipt
  BuildReceipt: undefined;
  ReceiptOtherDetails: undefined;
  CreateReceipt: {receipt?: IReceipt};
  ReceiptDetails: {id: IReceipt['_id']};
  ReceiptSuccess: {id: IReceipt['_id']};

  //Product
  CreateProduct: undefined;
  AddInventory: {product?: IProduct};
  InventoryOtherDetails: undefined;

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
      <ReceiptProvider>
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

          {/* Customers */}
          <MainStack.Screen
            name="AddCustomer"
            component={AddCustomer}
            options={{headerShown: false}}
          />
          <MainStack.Screen
            name="CustomerDetails"
            component={CustomerDetails}
            options={({route}) => ({
              title: route.params.customer.name,
              headerShown: false,
            })}
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

          {/* Receipt */}
          <MainStack.Screen
            name="ReceiptDetails"
            component={ReceiptDetailsScreen}
            options={{headerShown: false}}
          />
          <MainStack.Screen
            name="CreateReceipt"
            component={CreateReceiptScreen}
            options={{headerShown: false}}
          />
          <MainStack.Screen
            name="ReceiptOtherDetails"
            options={{headerShown: false}}
            component={ReceiptOtherDetailsScreen}
          />
          <MainStack.Screen
            name="ReceiptSuccess"
            options={{headerShown: false}}
            component={ReceiptSuccessScreen}
          />
          <MainStack.Screen
            name="BuildReceipt"
            options={{headerShown: false}}
            component={BuildReceiptScreen}
          />

          {/* Product */}
          <MainStack.Screen
            name="CreateProduct"
            component={CreateProductScreen}
            options={{headerShown: false}}
          />
          <MainStack.Screen
            name="AddInventory"
            component={AddInventoryScreen}
            options={{headerShown: false}}
          />
          <MainStack.Screen
            name="InventoryOtherDetails"
            component={InventoryOtherDetailsScreen}
            options={{headerShown: false}}
          />
        </MainStack.Navigator>
      </ReceiptProvider>
    </PubNubProvider>
  );
};

export default MainScreens;
