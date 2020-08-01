import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {applyStyles} from '../../helpers/utils';
import {IContact, IConversation} from '../../models';
import {ICredit} from '../../models/Credit';
import {ICreditPayment} from '../../models/CreditPayment';
import {IPayment} from '../../models/Payment';
import {
  getAuthService,
  getContactsService,
  getPubNubService,
} from '../../services';
import {colors} from '../../styles';
import {BusinessSetup} from '../BusinessSetup';
import {
  CreditDetails,
  CreditPaymentDetails,
  Finances,
  NewReceipt,
  OverdueCredit,
  Receipts,
  RecordCreditPayment,
  TotalCredit,
} from './business';
import ChatDetailsScreen from './chat/ChatDetailsScreen';
import ChatScreen from './chat/ChatScreen';
import ContactsScreen from './chat/ContactsScreen';
import SelectGroupMembersScreen from './chat/SelectGroupMembersScreen';
import SetGroupDetailsScreen from './chat/SetGroupDetailsScreen';
import AddCustomer from './customers/AddCustomer';
import CreditPayment from './customers/CreditPayment';
import {CustomerCreditPaymentDetails} from './customers/CreditPaymentDetails';
import CustomerDetails from './customers/CustomerDetails';
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
  NewReceipt: {customer: Customer};
  StatusModal: {status: string; text: string; onClick(): void};
  Finances: undefined;
  Inventory: undefined;
  Expenses: undefined;
  Credit: undefined;
  AddCustomer: undefined;
  CustomerDetails: {customer: any};
  CustomerRecordCreditPayment: undefined;
  CustomerCreditPayment: {creditDetails: CreditDetails};
  CustomerPaymentDetails: {payment: Payment};
  CustomerOrderDetails: {order: Order};
  CustomerTotalCredit: {credits: ICredit[]};
  CustomerCreditPaymentDetails: {creditPaymentDetails: IPayment};
  CustomerOverdueCredit: {credits: ICredit[]};
  BusinessSetup: undefined;
  SelectGroupMembers: undefined;
  SetGroupDetails: {members: IContact[]};
  TotalCredit: {credits: ICredit[]};
  OverdueCredit: {credits: ICredit[]};
  RecordCreditPayment: undefined;
  CreditDetails: {creditDetails: CreditDetails};
  CreditPaymentDetails: {creditPaymentDetails: ICreditPayment};
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = ({navigation}: any) => {
  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);
  const handleError = useErrorHandler();
  const authService = getAuthService();

  // TODO: set initial route based on if user has setup business
  const initialRouteName = !authService.getUser()?.updated_at
    ? 'BusinessSetup'
    : 'Home';

  useEffect(() => {
    const user = authService.getUser();
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
  }, [authService]);

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

  return (
    <PubNubProvider client={pubNubClient}>
      <MainStack.Navigator initialRouteName={initialRouteName}>
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
          name="Chat"
          component={ChatScreen}
          options={{
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
          name="ChatDetails"
          component={ChatDetailsScreen}
          options={{
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
          name="SelectGroupMembers"
          component={SelectGroupMembersScreen}
          options={{
            headerTitle: 'New Group',
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
          name="SetGroupDetails"
          component={SetGroupDetailsScreen}
          options={{
            headerTitle: 'New Group',
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
          name="Receipts"
          component={Receipts}
          options={{
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
          name="NewReceipt"
          component={NewReceipt}
          options={{
            title: 'New Receipt',
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
          name="StatusModal"
          component={StatusModal}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="Finances"
          component={Finances}
          options={{
            title: 'My Finances',
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
          name="AddCustomer"
          component={AddCustomer}
          options={{
            title: 'Add Customer',
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
          name="CustomerDetails"
          component={CustomerDetails}
          options={({route}) => ({
            title: route.params.customer.name,
            headerStyle: {
              backgroundColor: colors.primary,
            },
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
          name="CustomerCreditPayment"
          component={CreditPayment}
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
          name="CustomerPaymentDetails"
          component={PaymentDetails}
          options={{
            title: 'Payment Details',
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
          name="CustomerOrderDetails"
          component={OrderDetails}
          options={{
            title: 'Order Details',
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
          name="CustomerTotalCredit"
          component={TotalCredit}
          options={{
            title: 'Total Credit',
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
          name="CustomerOverdueCredit"
          component={OverdueCredit}
          options={{
            title: 'Overdue Credit',
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
          name="OverdueCredit"
          component={OverdueCredit}
          options={{
            title: 'Overdue Credit',
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
          name="RecordCreditPayment"
          component={RecordCreditPayment}
          options={{
            title: 'Record Credit Payment',
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
          name="CreditDetails"
          component={CreditDetails}
          options={{
            title: 'Credit Details',
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
          name="CreditPaymentDetails"
          component={CreditPaymentDetails}
          options={{
            title: 'Credit Payment Details',
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
