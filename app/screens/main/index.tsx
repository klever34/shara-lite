import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useContext, useEffect, useState} from 'react';
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
  getAuthService,
  getContactsService,
  getPubNubService,
  getRealmService,
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
import {ISupplier} from 'app/models/Supplier';
import {RealmContext} from '../../services/realm/provider';
import {loginToRealm} from '../../services/realm';

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
  BusinessSetup: undefined;
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
  ReceiveInventoryStock: {supplier: ISupplier};
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = ({navigation}: any) => {
  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const user = authService.getUser();
  const initialRouteName =
    user?.businesses && user?.businesses.length ? 'Home' : 'BusinessSetup';
  // @ts-ignore
  const {realm, updateSyncRealm} = useContext(RealmContext);

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

  useEffect(() => {
    updateRealm();
  });

  const updateRealm = async () => {
    const authService = getAuthService();
    const {jwt} = authService.getRealmCredentials();
    const createdRealm = await loginToRealm({jwt});
    updateSyncRealm && updateSyncRealm(createdRealm);
    const realmService = getRealmService();
    realmService.setInstance(realm as Realm);
  };

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
        initialRouteName={initialRouteName}
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="ChatDetails"
          component={ChatDetailsScreen}
          options={{
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="SelectGroupMembers"
          component={SelectGroupMembersScreen}
          options={{
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="SetGroupDetails"
          component={SetGroupDetailsScreen}
          options={{
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="NewReceipt"
          component={NewReceipt}
          options={{
            title: 'New Receipt',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="AddCustomer"
          component={AddCustomer}
          options={{
            title: 'Add Customer',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerDetails"
          component={CustomerDetails}
          options={({route}) => ({
            title: route.params.customer.name,
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          })}
        />
        <MainStack.Screen
          name="CustomerRecordCreditPayment"
          component={RecordPayment}
          options={{
            title: 'Record Payment',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerCreditPayment"
          component={CreditPayment}
          options={{
            title: 'Credit Payment',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerPaymentDetails"
          component={PaymentDetails}
          options={{
            title: 'Payment Details',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerOrderDetails"
          component={OrderDetails}
          options={{
            title: 'Order Details',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerTotalCredit"
          component={CustomerTotalCredit}
          options={{
            title: 'Total Credit',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerOverdueCredit"
          component={CustomerOverdueCredit}
          options={{
            title: 'Overdue Credit',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CustomerCreditPaymentDetails"
          component={CustomerCreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="BusinessSetup"
          options={{
            headerShown: false,
          }}
          component={BusinessSetup}
        />
        <MainStack.Screen
          name="TotalCredit"
          component={TotalCredit}
          options={{
            title: 'Total Credit',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="OverdueCredit"
          component={OverdueCredit}
          options={{
            title: 'Overdue Credit',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="RecordCreditPayment"
          component={RecordCreditPayment}
          options={{
            title: 'Record Credit Payment',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CreditDetails"
          component={CreditDetails}
          options={{
            title: 'Credit Details',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
        <MainStack.Screen
          name="CreditPaymentDetails"
          component={CreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
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
            headerTitleStyle: {
              fontSize: 16,
              fontFamily: 'CocogoosePro-SemiLight',
            },
            headerTintColor: '#fff',
          }}
        />
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

export default MainScreens;
