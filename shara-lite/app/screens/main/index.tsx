import EmptyState from '@/components/EmptyState';
import {EntryView} from '@/components/EntryView';
import {TransactionDetailsProps} from '@/components/TransactionDetails';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import CustomerDetailsScreen from '@/screens/main/customers/CustomerDetailsScreen';
import RecordCollectionScreen from '@/screens/main/entry/RecordCollectionScreen';
import RecordSaleScreen from '@/screens/main/entry/RecordSaleScreen';
import {HomeScreen} from '@/screens/main/HomeScreen';
import {MoreScreen} from '@/screens/main/more';
import {
  BusinessSettings,
  UserProfileSettings,
} from '@/screens/main/more/settings';
import {PaymentsScreen} from '@/screens/main/payments';
import {getI18nService, getNotificationService} from '@/services';
import {useActivity} from '@/services/activity';
import {useCreditReminder} from '@/services/credit-reminder';
import {useCustomer} from '@/services/customer/hook';
import {useAppNavigation, useRepeatBackToExit} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import useSyncLoader from '@/services/realm/hooks/use-sync-loader';
import {RealmContext} from '@/services/realm/provider';
import {applyStyles, colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import {ObjectId} from 'bson';
import React, {useCallback, useContext, useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {EditCustomerScreen} from './customers/EditCustomerScreen';
import {ReminderSettingsScreen} from './customers/ReminderSettingsScreen';
import {
  SelectCustomerListScreen,
  SelectCustomerListScreenParams,
} from './entry/SelectCustomerScreen';
import FeedbackScreen from './more/feedback';
import ReferralScreen from './more/referral';
import {ReportScreen} from './report';
import {EditTransactionScreen} from './transactions/EditTransactionScreen';
import {TransactionListProvider} from './transactions/hook';
import {LedgerEntryScreen} from './transactions/LedgerEntryScreen';
import TransactionDetailsScreen from './transactions/TransactionDetailsScreen';
import {TransactionSuccessScreen} from './transactions/TransactionSuccessScreen';
import {DrawdownScreen} from '@/screens/main/money/DrawdownScreen';

const strings = getI18nService().strings;

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

  // Money
  Drawdown: undefined;
};

const MainStack = createStackNavigator<MainStackParamList>();

const MainScreens = () => {
  useRepeatBackToExit();
  const realm = useRealm();
  const {isSyncCompleted} = useContext(RealmContext);
  const {getCustomer} = useCustomer();
  const navigation = useAppNavigation();
  const {saveActivity} = useActivity();

  useSyncLoader();
  useCreditReminder();

  const handleSaveReminderNotification = useCallback(
    async (remoteMessage) => {
      const payload =
        remoteMessage?.data?.payload &&
        JSON.parse(remoteMessage?.data?.payload);

      if (realm && isSyncCompleted && payload) {
        if (payload.type === 'activity') {
          const activity = payload.activity;
          await saveActivity({activity});
        }
      }
    },
    [realm, saveActivity, isSyncCompleted],
  );

  // Effect to when FCM notification is clicked
  useEffect(() => {
    getNotificationService().onNotificationOpenedApp((remoteMessage) => {
      const payload =
        remoteMessage?.data?.payload &&
        JSON.parse(remoteMessage?.data?.payload);

      if (realm && isSyncCompleted && payload && payload.customer) {
        const customerId = new ObjectId(payload.customer._id);
        const customer = getCustomer({customerId});

        navigation.navigate('CustomerDetails', {
          customer,
        });
      } else {
        navigation.navigate('Home');
      }
    });
  }, [realm, isSyncCompleted, navigation, getCustomer]);

  // Effect to run when app is in background and notification comes in
  useEffect(() => {
    const unsubscribe = getNotificationService().setBackgroundMessageHandler(
      handleSaveReminderNotification,
    );
    return unsubscribe;
  }, [handleSaveReminderNotification]);

  // Effect to run when app is in foreground and notification comes in
  useEffect(() => {
    const unsubscribe = getNotificationService().onMessage(
      handleSaveReminderNotification,
    );
    return unsubscribe;
  }, [handleSaveReminderNotification]);

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
        heading={strings('alert.sync.title')}
        text={strings('alert.sync.description')}
        source={require('../../assets/images/coming-soon.png')}>
        <View style={applyStyles('mt-lg')}>
          <ActivityIndicator color={colors.primary} size={40} />
        </View>
      </EmptyState>
    );
  }

  return (
    <TransactionListProvider>
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
            initialParams={{
              onSelectCustomer: () => {},
            }}
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

          {/* Money */}
          <MainStack.Screen
            name="Drawdown"
            component={DrawdownScreen}
            options={{
              headerShown: false,
            }}
          />
        </MainStack.Navigator>
      </EntryView>
    </TransactionListProvider>
  );
};

export default MainScreens;
