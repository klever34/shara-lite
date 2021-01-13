import EmptyState from '@/components/EmptyState';
import {IReceipt} from '@/models/Receipt';
import CustomerDetailsScreen from '@/screens/main/customers/CustomerDetailsScreen';
import {HomeScreen} from '@/screens/main/HomeScreen';
import {
  BusinessSettings,
  UserProfileSettings,
} from '@/screens/main/more/settings';
import {useCreditReminder} from '@/services/credit-reminder';
import {useRepeatBackToExit} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import useSyncLoader from '@/services/realm/hooks/use-sync-loader';
import {RealmContext} from '@/services/realm/provider';
import {applyStyles, colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useContext} from 'react';
import {ActivityIndicator, View} from 'react-native';
import TransactionDetailsScreen from './transactions/TransactionDetailsScreen';
import {TransactionDetailsProps} from '@/components/TransactionDetails';
import {
  SelectCustomerListScreen,
  SelectCustomerListScreenParams,
} from './entry/SelectCustomerScreen';
import ReferralScreen from './more/referral';
import {LedgerEntryScreen} from './transactions/LedgerEntryScreen';
import {MoreScreen} from '@/screens/main/more';
import {PaymentsScreen} from '@/screens/main/payments';
import {EntryView} from '@/components/EntryView';
import RecordSaleScreen from '@/screens/main/entry/RecordSaleScreen';
import RecordCollectionScreen from '@/screens/main/entry/RecordCollectionScreen';
import {TransactionSuccessScreen} from './transactions/TransactionSuccessScreen';
import {ICustomer} from '@/models';
import {EditTransactionScreen} from './transactions/EditTransactionScreen';
import {ReportScreen} from './report';
import {ReminderSettingsScreen} from './customers/ReminderSettingsScreen';
import {EditCustomerScreen} from './customers/EditCustomerScreen';
import FeedbackScreen from './more/feedback';

export type MainStackParamList = {
  Home: undefined;

  // Customers
  EditCustomer: {customer: ICustomer};
  CustomerDetails: TransactionDetailsProps;
  ReminderSettings: {customer: ICustomer};
  SelectCustomerList: SelectCustomerListScreenParams;

  // Transaction
  RecordSale: {
    goBack?: () => void;
    customer?: ICustomer;
  };
  EditTransaction: {transaction: IReceipt};
  TransactionDetails: {transaction: IReceipt};
  LedgerEntry: {transaction: IReceipt; showCustomer: boolean};
  RecordCollection: {customer: ICustomer; goBack?: () => void};
  TransactionSuccess: {transaction: IReceipt; onDone?: () => void};

  // More
  Settings: undefined;
  Referral: undefined;
  Feedback: undefined;
  PaymentSettings: undefined;
  BusinessSettings: undefined;
  UserProfileSettings: undefined;

  // Report
  Report: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = () => {
  useRepeatBackToExit();
  const realm = useRealm();
  const {isSyncCompleted} = useContext(RealmContext);

  useSyncLoader();
  useCreditReminder();

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

  return (
    <EntryView>
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
          name="CustomerDetails"
          component={CustomerDetailsScreen}
          options={({route}) => ({
            title: route.params.customer?.name,
            headerShown: false,
          })}
        />

        <MainStack.Screen
          name="SelectCustomerList"
          component={SelectCustomerListScreen}
          options={{headerShown: false}}
          initialParams={{onSelectCustomer: () => {}}}
        />

        <MainStack.Screen
          name="RecordSale"
          component={RecordSaleScreen}
          options={{headerShown: false}}
        />

        <MainStack.Screen
          name="RecordCollection"
          component={RecordCollectionScreen}
          options={{headerShown: false}}
        />

        <MainStack.Screen
          name="ReminderSettings"
          component={ReminderSettingsScreen}
          options={{headerShown: false}}
        />

        <MainStack.Screen
          name="EditCustomer"
          component={EditCustomerScreen}
          options={{headerShown: false}}
        />

        {/* More */}
        <MainStack.Screen
          name="BusinessSettings"
          component={BusinessSettings}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="UserProfileSettings"
          component={UserProfileSettings}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="Referral"
          component={ReferralScreen}
          options={{headerShown: false}}
        />
        <MainStack.Screen
          name="Settings"
          component={MoreScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="PaymentSettings"
          component={PaymentsScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{headerShown: false}}
        />

        {/* Transactions */}
        <MainStack.Screen
          name="TransactionDetails"
          component={TransactionDetailsScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="LedgerEntry"
          component={LedgerEntryScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="EditTransaction"
          component={EditTransactionScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="TransactionSuccess"
          component={TransactionSuccessScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* Report */}
        <MainStack.Screen
          name="Report"
          component={ReportScreen}
          options={{
            headerShown: false,
          }}
        />
      </MainStack.Navigator>
    </EntryView>
  );
};

export default MainScreens;
