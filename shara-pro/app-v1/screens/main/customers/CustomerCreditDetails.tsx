import Icon from 'app-v1/components/Icon';
import Touchable from 'app-v1/components/Touchable';
import {getAuthService, getAnalyticsService} from 'app-v1/services';
import {getAllPayments} from 'app-v1/services/ReceiptService';
import {ShareHookProps, useShare} from 'app-v1/services/share';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {CreditPaymentForm} from 'app-v1/components';
import {amountWithCurrency, applyStyles} from 'app-v1/helpers/utils';
import {ICredit} from 'app-v1/models/Credit';
import {colors} from 'app-v1/styles';
import {ReceiptImage} from '../business';
import {useRealm} from 'app-v1/services/realm';
import {saveCreditPayment} from 'app-v1/services/CreditPaymentService';
import HeaderRight from '../../../components/HeaderRight';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '..';

export const CustomerCreditDetails = ({
  route,
}: StackScreenProps<MainStackParamList, 'CustomerCreditDetails'>) => {
  const realm = useRealm();
  const authService = getAuthService();
  const user = authService.getUser();
  const navigation = useNavigation();
  const analyticsService = getAnalyticsService();

  const [isLoading, setIsLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState('');

  const {creditDetails}: {creditDetails: ICredit} = route.params;
  const businessInfo = user?.businesses[0];
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

  const shareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Payment Reminder',
    subject: 'Payment Reminder',
    message: paymentReminderMessage,
    recipient: creditDetails.customer?.mobile,
  };

  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    shareProps,
  );

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        content_type: 'debit-reminder',
        item_id: creditDetails?.receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, creditDetails, handleSmsShare]);

  const onEmailShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'email',
        content_type: 'debit-reminder',
        item_id: creditDetails?.receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, creditDetails, handleEmailShare]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'debit-reminder',
        item_id: creditDetails?.receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, creditDetails, handleWhatsappShare]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          menuOptions={[
            {
              text: 'Help',
              onSelect: () => {},
            },
          ]}
        />
      ),
    });
  }, [navigation]);

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
                <Touchable onPress={onWhatsappShare}>
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
                <Touchable onPress={onSmsShare}>
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
              <Touchable onPress={onEmailShare}>
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
