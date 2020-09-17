import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import Share from 'react-native-share';
import React, {useCallback, useState, useLayoutEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
  Alert,
} from 'react-native';
import {CreditPaymentForm} from '../../../components';
import {
  applyStyles,
  amountWithCurrency,
  getCustomerWhatsappNumber,
} from '../../../helpers/utils';
import {ICredit} from '../../../models/Credit';
import {colors} from '../../../styles';
import {useRealm} from '../../../services/realm';
import {saveCreditPayment} from '../../../services/CreditPaymentService';
import HeaderRight from '../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '..';
import {useScreenRecord} from '../../../services/analytics';
import Touchable from '@/components/Touchable';
import Icon from '@/components/Icon';
import {getAuthService} from '@/services';
import {getAllPayments} from '@/services/ReceiptService';
import {ReceiptImage} from '../business';

export const CustomerCreditDetails = ({
  route,
}: StackScreenProps<MainStackParamList, 'CustomerCreditDetails'>) => {
  useScreenRecord();
  const realm = useRealm();
  const authService = getAuthService();
  const user = authService.getUser();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState('');

  const {creditDetails}: {creditDetails: ICredit} = route.params;
  const businessInfo = user?.businesses[0];
  const userCountryCode = user?.country_code;
  const allPayments = creditDetails.receipt
    ? getAllPayments({receipt: creditDetails.receipt})
    : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  const creditAmountLeft = creditDetails?.receipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );
  const paymentReminderMessage = `Hello, you purchased some items from ${
    businessInfo?.name
  } for ${amountWithCurrency(
    creditDetails.receipt?.total_amount,
  )}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
    creditDetails.due_date
      ? format(new Date(creditDetails.due_date), 'MMM dd, yyyy')
      : ''
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nhttp://shara.co`;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleSmsShare = useCallback(async () => {
    const shareOptions = {
      // @ts-ignore
      social: Share.Social.SMS,
      title: 'Payment Reminder',
      message: paymentReminderMessage,
      recipient: `${creditDetails.customer?.mobile}`,
    };

    if (!creditDetails.customer?.mobile) {
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    }
  }, [creditDetails.customer, paymentReminderMessage]);

  const handleEmailShare = useCallback(async () => {
    const shareOptions = {
      title: 'Payment Reminder',
      subject: 'Payment Reminder',
      message: paymentReminderMessage,
      url: `data:image/png;base64,${receiptImage}`,
    };

    try {
      await Share.open(shareOptions);
    } catch (e) {
      console.log('Error', e.error);
    }
  }, [paymentReminderMessage, receiptImage]);

  const handleWhatsappShare = useCallback(async () => {
    const mobile = creditDetails?.customer?.mobile;
    const whatsAppNumber = getCustomerWhatsappNumber(mobile, userCountryCode);
    const shareOptions = {
      whatsAppNumber,
      title: 'Payment Reminder',
      social: Share.Social.WHATSAPP,
      message: paymentReminderMessage,
      url: `data:image/png;base64,${receiptImage}`,
    };
    const errorMessages = {
      filename: 'Invalid file attached',
      whatsAppNumber: 'Please check the phone number supplied',
    } as {[key: string]: any};

    if (!creditDetails?.customer?.mobile) {
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', errorMessages[e.error]);
      }
    }
  }, [creditDetails, paymentReminderMessage, receiptImage, userCountryCode]);

  const handleSubmit = useCallback(
    (payload, callback) => {
      if (creditDetails) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          saveCreditPayment({
            realm,
            ...payload,
            customer: creditDetails.customer,
          });
          callback();
          navigation.navigate('CustomerDetails', {screen: 'CreditsTab'});
          ToastAndroid.show('Credit payment recorded', ToastAndroid.SHORT);
        }, 300);
      }
    },
    [realm, navigation, creditDetails],
  );

  return (
    <ScrollView
      persistentScrollbar={true}
      style={styles.container}
      keyboardShouldPersistTaps="always">
      <View
        style={applyStyles('mb-xl pb-md', {
          borderBottomColor: colors['gray-20'],
          borderBottomWidth: 1,
        })}>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Customer</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.customer?.name}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              {amountWithCurrency(creditDetails.amount_left)}
            </Text>
          </View>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Given on</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'MMM dd, yyyy')
                : ''}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'hh:mm:a')
                : ''}
            </Text>
          </View>
          {creditDetails.due_date && (
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Due on</Text>
              <Text
                style={applyStyles(styles.itemDataMedium, 'text-400', {
                  color: colors.primary,
                })}>
                {creditDetails.due_date
                  ? format(new Date(creditDetails.due_date), 'MMM dd, yyyy')
                  : ''}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {creditDetails.due_date
                  ? format(new Date(creditDetails.due_date), 'hh:mm:a')
                  : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
      {!!creditDetails.customer?.name && (
        <View
          style={applyStyles('pb-xl mb-xl', {
            borderBottomColor: colors['gray-20'],
            borderBottomWidth: 1,
          })}>
          <View>
            <Text
              style={applyStyles('text-400 mb-lg', {
                fontSize: 18,
                color: colors.primary,
              })}>
              Send Reminder
            </Text>
          </View>
          <View
            style={applyStyles('flex-row items-center justify-space-between')}>
            {creditDetails.customer.mobile && (
              <View style={applyStyles({width: '33%'})}>
                <Touchable onPress={handleWhatsappShare}>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-center',
                      {
                        height: 48,
                      },
                    )}>
                    <Icon
                      size={24}
                      type="ionicons"
                      name="logo-whatsapp"
                      color={colors.whatsapp}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm',
                        'text-400',
                        'text-uppercase',
                        {
                          color: colors['gray-200'],
                        },
                      )}>
                      whatsapp
                    </Text>
                  </View>
                </Touchable>
              </View>
            )}
            {creditDetails.customer.mobile && (
              <View style={applyStyles({width: '33%'})}>
                <Touchable onPress={handleSmsShare}>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-center',
                      {
                        height: 48,
                      },
                    )}>
                    <Icon
                      size={24}
                      name="message-circle"
                      type="feathericons"
                      color={colors.primary}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm',
                        'text-400',
                        'text-uppercase',
                        {
                          color: colors['gray-200'],
                        },
                      )}>
                      sms
                    </Text>
                  </View>
                </Touchable>
              </View>
            )}
            <View style={applyStyles({width: '33%'})}>
              <Touchable onPress={handleEmailShare}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                    {
                      height: 48,
                    },
                  )}>
                  <Icon
                    size={24}
                    name="mail"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors['gray-200'],
                    })}>
                    email
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
      )}
      <View>
        <Text
          style={applyStyles('text-400', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Credit Payment
        </Text>
        <View style={applyStyles({marginBottom: 100})}>
          <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
        </View>
      </View>
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          user={user}
          amountPaid={totalAmountPaid}
          creditAmount={creditAmountLeft}
          tax={creditDetails.receipt?.tax}
          customer={creditDetails.customer}
          products={creditDetails.receipt?.items}
          getImageUri={(data) => setReceiptImage(data)}
          totalAmount={creditDetails.receipt?.total_amount}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  item: {
    paddingBottom: 24,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors['gray-200'],
    textTransform: 'uppercase',
  },
  itemDataLarge: {
    fontSize: 18,
    color: colors['gray-300'],
  },
  itemDataMedium: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  itemDataSmall: {
    fontSize: 12,
    color: colors['gray-300'],
  },
});
