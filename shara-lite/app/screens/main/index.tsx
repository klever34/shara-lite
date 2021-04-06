import EmptyState from '@/components/EmptyState';
import {EntryView} from '@/components/EntryView';
import OfflineModalProvider from '@/components/OfflineModalProvider';
import {TransactionDetailsProps} from '@/components/TransactionDetails';
import {ICustomer} from '@/models';
import {IBNPLApproval} from '@/models/BNPLApproval';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {IBNPLRepayment} from '@/models/BNPLRepayment';
import {IReceipt} from '@/models/Receipt';
import CustomerDetailsScreen from '@/screens/main/customers/CustomerDetailsScreen';
import RecordCollectionScreen from '@/screens/main/entry/RecordCollectionScreen';
import RecordSaleScreen from '@/screens/main/entry/RecordSaleScreen';
import {HomeScreen} from '@/screens/main/HomeScreen';
import {DrawdownScreen} from '@/screens/main/money/DrawdownScreen';
import {MoreScreen} from '@/screens/main/more';
import {
  BusinessSettings,
  UserProfileSettings,
} from '@/screens/main/more/settings';
import {PaymentsScreen} from '@/screens/main/payments';
import {
  getAuthService,
  getI18nService,
  getNotificationService,
} from '@/services';
import {useCollection} from '@/services/collection';
import {useCreditReminder} from '@/services/credit-reminder';
import {useCustomer} from '@/services/customer/hook';
import {useAppNavigation, useRepeatBackToExit} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import useSyncLoader from '@/services/realm/hooks/use-sync-loader';
import {RealmContext} from '@/services/realm/provider';
import {applyStyles, colors} from '@/styles';
import {ObjectId} from 'bson';
import {parseISO} from 'date-fns';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import getUuidByString from 'uuid-by-string';
import {BNPLScreen} from './bnpl';
import {BNPLClientScreen} from './bnpl/BNPLClientScreen';
import {BNPLRecordTransactionScreen} from './bnpl/BNPLRecordTransactionScreen';
import {BNPLRepaymentSuccessScreen} from './bnpl/BNPLRepaymentSuccessScreen';
import {BNPLTransactionDetailsScreen} from './bnpl/BNPLTransactionDetailsScreen';
import {BNPLTransactionSuccessScreen} from './bnpl/BNPLTransactionSuccessScreen';
import {EditCustomerScreen} from './customers/EditCustomerScreen';
import {ReminderSettingsScreen} from './customers/ReminderSettingsScreen';
import RequestPaymentScreen from './entry/RequestPaymentScreen';
import RequestPaymentSuccessScreen from './entry/RequestPaymentSuccessScreen';
import {
  SelectCustomerListScreen,
  SelectCustomerListScreenParams,
} from './entry/SelectCustomerScreen';
import FeedbackScreen from './more/feedback';
import ReferralScreen from './more/referral';
import {BVNVerification} from './payments/BVNVerification';
import DisburementScreen from './payments/DisburementScreen';
import {ReportScreen} from './report';
import {EditTransactionScreen} from './transactions/EditTransactionScreen';
import {LedgerEntryScreen} from './transactions/LedgerEntryScreen';
import TransactionDetailsScreen from './transactions/TransactionDetailsScreen';
import {TransactionSuccessScreen} from './transactions/TransactionSuccessScreen';

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
  RequestPayment: {customer: ICustomer; goBack?: () => void};
  LedgerEntry: {transaction: IReceipt; showCustomer: boolean};
  RecordCollection: {customer: ICustomer; goBack?: () => void};
  TransactionSuccess: {transaction: IReceipt; onDone?: () => void};
  RequestPaymentSuccess: {amount: number; customer: ICustomer; note?: string};

  // More
  Settings: undefined;
  Referral: undefined;
  Feedback: undefined;
  PaymentSettings: undefined;
  BVNVerification: undefined;
  BusinessSettings: undefined;
  DisburementScreen: undefined;
  UserProfileSettings: undefined;

  // Report
  Report: undefined;

  // Money
  Drawdown: undefined;
  BNPLScreen: undefined;
  BNPLClientScreen: {data: IBNPLDrawdown};
  BNPLRecordTransactionScreen: undefined;
  BNPLTransactionDetailsScreen: {transaction: IBNPLDrawdown};
  BNPLTransactionSuccessScreen: {
    transaction: {
      receiptData?: IReceipt;
      drawdown: IBNPLDrawdown;
      repayments: IBNPLRepayment[];
      approval: IBNPLApproval;
    };
    onDone?: () => void;
  };
  BNPLRepaymentSuccessScreen: {
    amount: number;
    transaction: {
      receiptData?: IReceipt;
      drawdown: IBNPLDrawdown;
      repayments: IBNPLRepayment[];
      approval: IBNPLApproval;
    };
    onDone?: () => void;
  };
};

const MainStack = createNativeStackNavigator<MainStackParamList>();

const MainScreens = () => {
  useRepeatBackToExit();
  const realm = useRealm();
  const {isSyncCompleted} = useContext(RealmContext);
  const {getCustomer} = useCustomer();
  const {saveCollection} = useCollection();
  const navigation = useAppNavigation();

  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);

  useSyncLoader();
  useCreditReminder();

  // Effect to setup PubNub
  useEffect(() => {
    const user = getAuthService().getUser();
    if (user) {
      const pubNub = new PubNub({
        subscribeKey: Config.PUBNUB_SUB_KEY,
        publishKey: Config.PUBNUB_PUB_KEY,
        uuid: getUuidByString(user.mobile),
      });
      const listener = {
        message: async (envelope: any) => {
          const collection = JSON.parse(envelope.message);
          if (realm) {
            await saveCollection({
              collection: {
                ...collection,
                meta: JSON.stringify(collection.meta),
                created_at: parseISO(collection.created_at),
                updated_at: parseISO(collection.updated_at),
              },
            });
          }
        },
      };
      setPubNubClient(pubNub);

      pubNub.addListener(listener);
      pubNub.subscribe({channels: ['collection_' + user?.id]});
      return () => {
        pubNub.removeListener(listener);
        pubNub.unsubscribeAll();
      };
    }
  }, []);

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

  if (!pubNubClient) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  return (
    <PubNubProvider client={pubNubClient}>
      <OfflineModalProvider>
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
              name="RequestPayment"
              component={RequestPaymentScreen}
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
            <MainStack.Screen
              name="BVNVerification"
              component={BVNVerification}
              options={{headerShown: false}}
            />
            <MainStack.Screen
              name="DisburementScreen"
              component={DisburementScreen}
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
            <MainStack.Screen
              name="RequestPaymentSuccess"
              component={RequestPaymentSuccessScreen}
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
            <MainStack.Screen
              name="BNPLScreen"
              component={BNPLScreen}
              options={{
                headerShown: true,
                headerTintColor: colors.white,
                headerStyle: applyStyles('bg-primary'),
                headerTitle: strings('bnpl.buy_now_pay_later'),
                headerTitleStyle: applyStyles('text-white text-capitalize'),
              }}
            />
            <MainStack.Screen
              name="BNPLClientScreen"
              component={BNPLClientScreen}
              options={{
                headerShown: false,
              }}
            />
            <MainStack.Screen
              name="BNPLTransactionSuccessScreen"
              component={BNPLTransactionSuccessScreen}
              options={{
                headerShown: false,
              }}
            />
            <MainStack.Screen
              name="BNPLRepaymentSuccessScreen"
              component={BNPLRepaymentSuccessScreen}
              options={{
                headerShown: false,
              }}
            />
            <MainStack.Screen
              name="BNPLRecordTransactionScreen"
              component={BNPLRecordTransactionScreen}
              options={{
                headerShown: false,
              }}
            />
            <MainStack.Screen
              name="BNPLTransactionDetailsScreen"
              component={BNPLTransactionDetailsScreen}
              options={{
                headerShown: true,
                headerTintColor: colors.white,
                headerStyle: applyStyles('bg-primary'),
                headerTitle: strings('bnpl.transaction_details'),
                headerTitleStyle: applyStyles('text-white text-capitalize'),
              }}
            />
          </MainStack.Navigator>
        </EntryView>
      </OfflineModalProvider>
    </PubNubProvider>
  );
};

export default MainScreens;
