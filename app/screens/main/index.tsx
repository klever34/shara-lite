import {FAButtonProps} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {ICredit} from '@/models/Credit';
import {ICreditPayment} from '@/models/CreditPayment';
import {IPayment} from '@/models/Payment';
import {IProduct} from '@/models/Product';
import {ISupplier} from '@/models/Supplier';
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
import {Results} from 'realm';
import getUuidByString from 'uuid-by-string';
import {IContact, IConversation} from '../../models';
import {
  getAnalyticsService,
  getAuthService,
  getPubNubService,
} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import {BusinessSetup} from '../BusinessSetup';
import {
  AddProduct,
  AddSupplier,
  CreditDetails,
  CreditPaymentDetails,
  DeliveryAgents,
  EditProduct,
  Finances,
  NewReceipt,
  OverdueCredit,
  ReceivedInventoryList,
  ReceiveInventory,
  ReceiveInventoryStock,
  RecordCreditPayment,
  Suppliers,
  TotalCredit,
  ViewProductDetails,
} from './business';
import {AddDeliveryAgent} from './business/finances/AddDeliveryAgent';
import {Expenses} from './business/finances/Expenses';
import ChatDetailsScreen from './chat/ChatDetailsScreen';
import ChatScreen from './chat/ChatScreen';
import ContactsScreen from './chat/ContactsScreen';
import SelectGroupMembersScreen from './chat/SelectGroupMembersScreen';
import SetGroupDetailsScreen from './chat/SetGroupDetailsScreen';
import AddCustomer from './customers/AddCustomer';
import CreditPayment from './customers/CreditPayment';
import {CustomerCreditPaymentDetails} from './customers/CreditPaymentDetails';
import {CustomerCreditDetails} from './customers/CustomerCreditDetails';
import CustomerDetails from './customers/CustomerDetails';
import {CustomerOverdueCredit} from './customers/CustomerOverdueCredit';
import {CustomerTotalCredit} from './customers/CustomerTotalCredit';
import OrderDetails from './customers/OrderDetails';
import PaymentDetails from './customers/PaymentDetails';
import RecordPayment from './customers/RecordPayment';
import HomeScreen from './HomeScreen';
import StatusModal from './StatusModal';

export type MainStackParamList = {
  Home: undefined;
  Chat: IConversation;
  ChatDetails: IConversation;
  Contacts: undefined;
  Receipts: undefined;
  NewReceipt: undefined;
  StatusModal: {status: string; text: string; onClick(): void};
  Finances: undefined;
  Inventory: undefined;
  Expenses: undefined;
  Credit: undefined;
  AddCustomer: undefined;
  CustomerDetails: {customer: any};
  CustomerRecordCreditPayment: undefined;
  CustomerCreditPayment: {creditDetails: ICredit};
  CustomerPaymentDetails: {payment: IPayment};
  CustomerOrderDetails: {order: any};
  CustomerTotalCredit: {credits: ICredit[]};
  CustomerCreditPaymentDetails: {creditPaymentDetails: IPayment};
  CustomerOverdueCredit: {credits: ICredit[]};
  CustomerCreditDetails: {creditDetails: ICredit};
  SelectGroupMembers: {
    participants?: Results<IContact>;
    title: string;
    next: (selectedMembers: IContact[]) => FAButtonProps;
  };
  SetGroupDetails: {
    participants: IContact[];
    title: string;
    next: (groupName: string) => FAButtonProps;
  };
  TotalCredit: undefined;
  OverdueCredit: undefined;
  RecordCreditPayment: undefined;
  CreditDetails: {creditDetails: ICredit};
  CreditPaymentDetails: {creditPaymentDetails: ICreditPayment};
  AddProduct: undefined;
  ViewProductDetails: {product: string};
  EditProduct: {product: IProduct};
  Suppliers: undefined;
  ReceiveInventory: undefined;
  DeliveryAgents: undefined;
  AddSupplier: undefined;
  AddDeliveryAgent: undefined;
  ReceiveInventoryStock: {supplier: ISupplier};
  ReceivedInventoryList: undefined;
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
  const [isBusinessSetupModalOpen, setIsBusinessSetupModalOpen] = useState(
    !(user?.businesses && user?.businesses.length) || false,
  );

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
          name="Contacts"
          component={ContactsScreen}
          options={{
            title: 'Select Contact',
          }}
        />
        <MainStack.Screen name="Chat" component={ChatScreen} />
        <MainStack.Screen name="ChatDetails" component={ChatDetailsScreen} />
        <MainStack.Screen
          name="SelectGroupMembers"
          component={SelectGroupMembersScreen}
        />
        <MainStack.Screen
          name="SetGroupDetails"
          component={SetGroupDetailsScreen}
        />
        <MainStack.Screen
          name="NewReceipt"
          component={NewReceipt}
          options={{
            title: 'New Receipt',
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
            title: 'My Finances',
          }}
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
          name="TotalCredit"
          component={TotalCredit}
          options={{
            title: 'Total Credit',
          }}
        />
        <MainStack.Screen
          name="OverdueCredit"
          component={OverdueCredit}
          options={{
            title: 'Overdue Credit',
          }}
        />
        <MainStack.Screen
          name="RecordCreditPayment"
          component={RecordCreditPayment}
          options={{
            title: 'Record Credit Payment',
          }}
        />
        <MainStack.Screen
          name="CreditDetails"
          component={CreditDetails}
          options={{
            title: 'Credit Details',
          }}
        />
        <MainStack.Screen
          name="CreditPaymentDetails"
          component={CreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
          }}
        />
        <MainStack.Screen
          name="AddProduct"
          component={AddProduct}
          options={{
            title: 'Add Product',
          }}
        />
        <MainStack.Screen
          name="EditProduct"
          component={EditProduct}
          options={{
            title: 'Edit Product',
          }}
        />
        <MainStack.Screen
          name="ViewProductDetails"
          component={ViewProductDetails}
          options={{
            title: 'Product Details',
          }}
        />
        <MainStack.Screen
          name="Suppliers"
          component={Suppliers}
          options={{
            title: 'Suppliers',
          }}
        />
        <MainStack.Screen
          name="DeliveryAgents"
          component={DeliveryAgents}
          options={{
            title: 'Delivery Agents',
          }}
        />
        <MainStack.Screen
          name="ReceiveInventory"
          component={ReceiveInventory}
          options={{
            title: 'Receive Inventory',
          }}
        />
        <MainStack.Screen
          name="ReceiveInventoryStock"
          component={ReceiveInventoryStock}
          options={{
            title: 'Receive Inventory',
          }}
        />
        <MainStack.Screen
          name="AddSupplier"
          component={AddSupplier}
          options={{
            title: 'Add Supplier',
          }}
        />
        <MainStack.Screen
          name="AddDeliveryAgent"
          component={AddDeliveryAgent}
          options={{
            title: 'Add Delivery Agent',
          }}
        />
        <MainStack.Screen
          name="ReceivedInventoryList"
          component={ReceivedInventoryList}
          options={{
            title: 'Received Inventory',
          }}
        />
        <MainStack.Screen
          name="Expenses"
          component={Expenses}
          options={{
            title: 'Record Expenses',
          }}
        />
      </MainStack.Navigator>
      <BusinessSetup
        visible={isBusinessSetupModalOpen}
        onClose={() => setIsBusinessSetupModalOpen(false)}
      />
    </PubNubProvider>
  );
};

export default MainScreens;
