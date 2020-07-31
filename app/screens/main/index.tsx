import {createStackNavigator} from '@react-navigation/stack';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {IContact, IConversation} from '../../models';
import {
  getAuthService,
  getContactsService,
  getPubNubService,
} from '../../services';
import {colors} from '../../styles';
import {
  NewReceipt,
  Receipts,
  Finances,
  TotalCredit,
  OverdueCredit,
  RecordCreditPayment,
  CreditDetails,
} from './business';
import ChatScreen from './chat/ChatScreen';
import ContactsScreen from './chat/ContactsScreen';
import HomeScreen from './HomeScreen';
import AddCustomer from './customers/AddCustomer';
import CreditPayment from './customers/CreditPayment';
import CustomerDetails from './customers/CustomerDetails';
import OrderDetails from './customers/OrderDetails';
import PaymentDetails from './customers/PaymentDetails';
import RecordPayment from './customers/RecordPayment';
import StatusModal from './StatusModal';
import {useErrorHandler} from 'react-error-boundary';
import {BusinessSetup} from '../BusinessSetup';
import SelectGroupMembersScreen from './chat/SelectGroupMembersScreen';
import SetGroupDetailsScreen from './chat/SetGroupDetailsScreen';
import {applyStyles} from '../../helpers/utils';
import ChatDetailsScreen from './chat/ChatDetailsScreen';

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
  RecordPayment: undefined;
  CreditPayment: {creditDetails: CreditDetails};
  PaymentDetails: {payment: Payment};
  OrderDetails: {order: Order};
  BusinessSetup: undefined;
  SelectGroupMembers: undefined;
  SetGroupDetails: {members: IContact[]};
  TotalCredit: undefined;
  OverdueCredit: undefined;
  RecordCreditPayment: undefined;
  CreditDetails: {creditDetails: CreditDetails};
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
          name="RecordPayment"
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
          name="CreditPayment"
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
          name="PaymentDetails"
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
          name="OrderDetails"
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
      </MainStack.Navigator>
    </PubNubProvider>
  );
};

export default MainScreens;
