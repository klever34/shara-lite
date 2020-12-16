import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import PaymentReminderImage from '@/components/PaymentReminderImage';
import PlaceholderImage from '@/components/PlaceholderImage';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {getAnalyticsService, getAuthService} from '@/services';
import {useReceipt} from '@/services/receipt';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import Config from 'react-native-config';
import {MainStackParamList} from '..';

type LedgerEntryScreenProps = {
  route: RouteProp<MainStackParamList, 'LedgerEntry'>;
};

export const LedgerEntryScreen = (props: LedgerEntryScreenProps) => {
  const {route} = props;
  const {transaction} = route.params;
  const {getReceiptAmounts} = useReceipt();
  const analyticsService = getAnalyticsService();
  const businessInfo = getAuthService().getBusinessInfo();
  const {creditAmountLeft, totalAmountPaid} = getReceiptAmounts(transaction);

  const [receiptImage, setReceiptImage] = useState('');
  const [reminderImage, setReminderImage] = useState('');

  const paymentLink = `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}`;
  const shareReceiptMessage = `Hi ${
    transaction.customer?.name ?? ''
  }, thank you for your recent purchase from ${
    businessInfo.name
  }. You paid ${amountWithCurrency(
    totalAmountPaid,
  )}.\n\nPowered by Shara for free.\nwww.shara.co`;
  const paymentReminderMessage = `Hello ${
    transaction.customer?.name ?? ''
  }, thank you for doing business with ${
    businessInfo?.name
  }. You owe ${amountWithCurrency(creditAmountLeft)}${
    transaction.dueDate
      ? ` which is due on ${format(
          new Date(transaction.dueDate),
          'MMM dd, yyyy',
        )}`
      : ''
  }.\n\nTo pay click\n ${paymentLink}\n\nPowered by Shara for free.\nwww.shara.co`;

  const reminderShareProps: ShareHookProps = {
    image: reminderImage,
    title: 'Payment Reminder',
    subject: 'Payment Reminder',
    message: paymentReminderMessage,
    recipient: transaction?.customer?.mobile,
  };

  const receiptShareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Share Receipt',
    subject: 'Share Receipt',
    message: shareReceiptMessage,
    recipient: transaction?.customer?.mobile,
  };

  const shareProps = transaction.isPaid
    ? receiptShareProps
    : reminderShareProps;

  const {handleSmsShare, handleWhatsappShare} = useShare(shareProps);

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        content_type: 'payment-reminder',
        item_id: '',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'payment-reminder',
        item_id: '',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, handleWhatsappShare]);
  return (
    <SafeAreaView>
      <View
        style={applyStyles('flex-row py-8 pr-16 bg-white justify-between', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <HeaderBackButton iconName="arrow-left" />
        <View style={applyStyles('items-end')}>
          <View style={applyStyles('pb-4 flex-row items-center')}>
            <Text style={applyStyles('text-400 text-black text-base')}>
              {transaction.customer?.name}
            </Text>
            <PlaceholderImage
              style={applyStyles('ml-4')}
              text={transaction?.customer?.name ?? ''}
            />
          </View>
          {transaction?.created_at && (
            <Text style={applyStyles('text-700 text-gray-50 text-xs')}>
              {format(transaction.created_at, 'dd MMM, yyyy')} -{' '}
              {format(transaction.created_at, 'hh:mm a')}
            </Text>
          )}
        </View>
      </View>
      <View
        style={applyStyles('flex-row items-center bg-white px-16 py-24', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <View style={applyStyles({width: '33%'})}>
          <Text
            style={applyStyles(
              'pb-4 text-xxs text-700 text-gray-200 text-uppercase',
            )}>
            Total
          </Text>
          <Text style={applyStyles('text-700 text-black text-base')}>
            {amountWithCurrency(transaction?.total_amount)}
          </Text>
        </View>
        <View style={applyStyles('items-end', {width: '33%'})}>
          <Text
            style={applyStyles(
              'pb-4 text-xxs text-700 text-gray-200 text-uppercase',
            )}>
            Collected
          </Text>
          <Text style={applyStyles('text-700 text-gray-300 text-base')}>
            {amountWithCurrency(totalAmountPaid)}
          </Text>
        </View>
        <View style={applyStyles('items-end', {width: '33%'})}>
          <Text
            style={applyStyles(
              'pb-4 text-xxs text-700 text-gray-200 text-uppercase',
            )}>
            Outstanding
          </Text>
          <Text style={applyStyles('text-700 text-red-100 text-base')}>
            {amountWithCurrency(creditAmountLeft)}
          </Text>
        </View>
      </View>
      <View style={applyStyles('px-16')}>
        {!!transaction.note && (
          <View style={applyStyles('pt-16')}>
            <Text
              style={applyStyles(
                'pb-4 text-xxs text-700 text-gray-300 text-uppercase',
              )}>
              Notes
            </Text>
            <Text style={applyStyles('text-400 text-gray-300 text-base')}>
              {transaction.note}
            </Text>
          </View>
        )}
        <View style={applyStyles('flex-row items-center pt-16')}>
          <Text
            style={applyStyles(
              'text-sm text-uppercase text-gray-300 text-700',
            )}>
            {transaction.isPaid ? 'Share receipt' : 'Send reminder'}:
          </Text>
          <View style={applyStyles('px-4')}>
            <Touchable onPress={onWhatsappShare}>
              <View
                style={applyStyles('px-2 flex-row center', {
                  height: 48,
                })}>
                <Icon
                  size={18}
                  type="ionicons"
                  name="logo-whatsapp"
                  color={colors.whatsapp}
                />
                <Text
                  style={applyStyles(
                    'pl-xs text-sm text-400 text-uppercase text-gray-200',
                  )}>
                  whatsapp
                </Text>
              </View>
            </Touchable>
          </View>
          <View style={applyStyles('px-4')}>
            <Touchable onPress={onSmsShare}>
              <View
                style={applyStyles('px-2 flex-row center', {
                  height: 48,
                })}>
                <Icon
                  size={18}
                  name="message-circle"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles(
                    'pl-xs text-sm text-400 text-uppercase text-gray-200',
                  )}>
                  sms
                </Text>
              </View>
            </Touchable>
          </View>
          <View style={applyStyles('px-4')}>
            <Touchable onPress={onWhatsappShare}>
              <View
                style={applyStyles('px-2 flex-row center', {
                  height: 48,
                })}>
                <Icon
                  size={18}
                  type="feathericons"
                  name="more-vertical"
                  color={colors['red-100']}
                />
                <Text
                  style={applyStyles(
                    'pl-xs text-sm text-400 text-uppercase text-gray-200',
                  )}>
                  other
                </Text>
              </View>
            </Touchable>
          </View>
        </View>
      </View>
      <View style={applyStyles({opacity: 0, height: 0})}>
        <PaymentReminderImage
          date={transaction.dueDate}
          amount={creditAmountLeft}
          getImageUri={(data) => setReminderImage(data)}
        />
      </View>
      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          note={transaction?.note}
          amountPaid={totalAmountPaid}
          creditAmount={creditAmountLeft}
          customer={transaction?.customer}
          createdAt={transaction?.created_at}
          creditDueDate={transaction?.dueDate}
          totalAmount={transaction.total_amount}
          getImageUri={(data) => setReceiptImage(data)}
          receiptNo={transaction?._id?.toString().substring(0, 6)}
        />
      </View>
    </SafeAreaView>
  );
};
