import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import {Results} from 'realm';
import getUuidByString from 'uuid-by-string';
import {FAButtonProps} from '../../components';
import {applyStyles} from '../../helpers/utils';
import {IContact, IConversation} from '../../models';
import {ICredit} from '../../models/Credit';
import {ICreditPayment} from '../../models/CreditPayment';
import {IPayment} from '../../models/Payment';
import {IProduct} from '../../models/Product';
import {
  getAnalyticsService,
  getAuthService,
  getContactsService,
  getPubNubService,
} from '../../services';
import {colors} from '../../styles';
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
  ReceiveInventory,
  RecordCreditPayment,
  Suppliers,
  TotalCredit,
  ViewProductDetails,
  ReceiveInventoryStock,
  ReceivedInventoryList,
} from './business';
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
import {ISupplier} from '../../models/Supplier';
import {AddDeliveryAgent} from './business/finances/AddDeliveryAgent';
import {Expenses} from './business/finances/Expenses';

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
  TotalCredit: {credits: ICredit[]};
  OverdueCredit: {credits: ICredit[]};
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

const MainScreens = ({navigation}: any) => {
  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const user = authService.getUser();
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

  useEffect(() => {
    const contactsService = getContactsService();
    contactsService.loadContacts().catch((error) => {
      handleError(error);
    });
  }, [navigation, handleError]);

  if (!pubNubClient) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  const stackOptions = {
    headerTitleStyle: {
      fontSize: 16,
      fontFamily: 'CocogoosePro-SemiLight',
    },
    headerTintColor: '#fff',
  };

  return (
    <PubNubProvider client={pubNubClient}>
      <MainStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
        }}>
        <MainStack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Shara',
            headerStyle: {
              elevation: 0,
              backgroundColor: colors.primary,
            },
            headerTitleStyle: {
              fontFamily: 'CocogoosePro-Regular',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="Contacts"
          component={ContactsScreen}
          options={{
            title: 'Select Contact',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="Chat"
          component={ChatScreen}
          options={stackOptions}
        />
        <MainStack.Screen
          name="ChatDetails"
          component={ChatDetailsScreen}
          options={stackOptions}
        />
        <MainStack.Screen
          name="SelectGroupMembers"
          component={SelectGroupMembersScreen}
          options={stackOptions}
        />
        <MainStack.Screen
          name="SetGroupDetails"
          component={SetGroupDetailsScreen}
          options={stackOptions}
        />
        <MainStack.Screen
          name="NewReceipt"
          component={NewReceipt}
          options={{
            title: 'New Receipt',
            ...stackOptions,
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
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={{
            title: 'Add Customer',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerDetails"
          component={CustomerDetails}
          options={({route}) => ({
            title: route.params.customer.name,
            ...stackOptions,
          })}
        />
        <MainStack.Screen
          name="CustomerRecordCreditPayment"
          component={RecordPayment}
          options={{
            title: 'Record Payment',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerCreditPayment"
          component={CreditPayment}
          options={{
            title: 'Credit Payment',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerPaymentDetails"
          component={PaymentDetails}
          options={{
            title: 'Payment Details',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerOrderDetails"
          component={OrderDetails}
          options={{
            title: 'Order Details',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerTotalCredit"
          component={CustomerTotalCredit}
          options={{
            title: 'Total Credit',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerOverdueCredit"
          component={CustomerOverdueCredit}
          options={{
            title: 'Overdue Credit',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerCreditDetails"
          component={CustomerCreditDetails}
          options={{
            title: 'Credit Payment',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CustomerCreditPaymentDetails"
          component={CustomerCreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="TotalCredit"
          component={TotalCredit}
          options={{
            title: 'Total Credit',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="OverdueCredit"
          component={OverdueCredit}
          options={{
            title: 'Overdue Credit',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="RecordCreditPayment"
          component={RecordCreditPayment}
          options={{
            title: 'Record Credit Payment',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CreditDetails"
          component={CreditDetails}
          options={{
            title: 'Credit Details',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="CreditPaymentDetails"
          component={CreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="AddProduct"
          component={AddProduct}
          options={{
            title: 'Add Product',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="EditProduct"
          component={EditProduct}
          options={{
            title: 'Edit Product',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="ViewProductDetails"
          component={ViewProductDetails}
          options={{
            title: 'Product Details',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="Suppliers"
          component={Suppliers}
          options={{
            title: 'Suppliers',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="DeliveryAgents"
          component={DeliveryAgents}
          options={{
            title: 'Delivery Agents',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="ReceiveInventory"
          component={ReceiveInventory}
          options={{
            title: 'Receive Inventory',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="ReceiveInventoryStock"
          component={ReceiveInventoryStock}
          options={{
            title: 'Receive Inventory',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="AddSupplier"
          component={AddSupplier}
          options={{
            title: 'Add Supplier',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="AddDeliveryAgent"
          component={AddDeliveryAgent}
          options={{
            title: 'Add Delivery Agent',
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="ReceivedInventoryList"
          component={ReceivedInventoryList}
          options={{
            title: 'Received Inventory',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
          }}
        />
        <MainStack.Screen
          name="Expenses"
          component={Expenses}
          options={{
            title: 'Record Expenses',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            ...stackOptions,
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
