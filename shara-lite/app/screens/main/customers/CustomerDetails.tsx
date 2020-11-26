import {Button, DatePicker} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {CustomersStackParamList} from '@/screens/main/customers';
import {ReceiptListItem} from '@/screens/main/transactions/ReceiptListItem';
import {getAnalyticsService, getAuthService} from '@/services';
import {CustomerContext} from '@/services/customer';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {Dimensions, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MainStackParamList} from '..';

type CustomerDetailsProps = {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerDetails'
  >;
};

const CustomerDetails = ({route}: CustomerDetailsProps) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const analyticsService = getAnalyticsService();
  const businessInfo = getAuthService().getBusinessInfo();

  const [receiptImage, setReceiptImage] = useState('');

  const {customer} = route.params;

  const receipt = {} as IReceipt;
  const totalAmountPaid = 0;
  const creditAmountLeft = 0;
  const creditDueDate = new Date();

  const paymentReminderMessage = `Hello ${
    customer?.name ?? ''
  }, thank you for your recent purchase from ${
    businessInfo?.name
  } for ${amountWithCurrency(
    receipt?.total_amount,
  )}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
    creditDueDate ? format(new Date(creditDueDate), 'MMM dd, yyyy') : ''
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nwww.shara.co`;

  const shareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Payment Reminder',
    subject: 'Payment Reminder',
    message: paymentReminderMessage,
    recipient: receipt?.customer?.mobile,
  };

  const {handleSmsShare, handleWhatsappShare} = useShare(shareProps);

  const [dueDate, setDueDate] = useState<Date | undefined>(
    creditDueDate || undefined,
  );

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        content_type: 'debit-reminder',
        item_id: receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare, receipt]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'debit-reminder',
        item_id: receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleWhatsappShare();
  }, [analyticsService, receipt, handleWhatsappShare]);

  const handleDueDateChange = useCallback((date?: Date) => {
    if (date) {
      setDueDate(date);
    }
  }, []);

  return (
    <CustomerContext.Provider value={customer}>
      <SafeAreaView style={applyStyles('flex-1')}>
        <View
          style={applyStyles('flex-row bg-white items-center', {
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,
            elevation: 10,
            borderBottomColor: colors['gray-10'],
          })}>
          <HeaderBackButton
            {...{iconName: 'arrow-left', onPress: () => navigation.goBack()}}
          />
          <ReceiptListItem
            isHeader
            style={applyStyles({
              left: -14,
              borderBottomWidth: 0,
              width: Dimensions.get('window').width - 34,
            })}
            receipt={undefined}
          />
        </View>
        <View style={applyStyles('bg-white center py-16')}>
          <DatePicker
            //@ts-ignore
            value={dueDate}
            minimumDate={new Date()}
            onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
            {(toggleShow) => (
              <Touchable onPress={toggleShow}>
                <View style={applyStyles('p-8 flex-row items-center')}>
                  <Icon
                    size={16}
                    name="calendar"
                    type="feathericons"
                    color={colors['red-200']}
                  />
                  <Text
                    style={applyStyles(
                      `pl-sm text-xs text-uppercase text-700 ${
                        dueDate ? 'text-gray-300' : 'text-red-200'
                      }`,
                    )}>
                    {dueDate
                      ? `on ${format(dueDate, 'ccc, dd MMM yyyy')}`
                      : 'set collection date'}
                  </Text>
                </View>
              </Touchable>
            )}
          </DatePicker>
          <View style={applyStyles('flex-row items-center')}>
            <Text
              style={applyStyles(
                'text-xs text-uppercase text-gray-50 text-700',
              )}>
              Send reminder:
            </Text>
            <View style={applyStyles('px-4')}>
              <Touchable onPress={onWhatsappShare}>
                <View
                  style={applyStyles('px-2 flex-row center', {
                    height: 48,
                  })}>
                  <Icon
                    size={16}
                    type="ionicons"
                    name="logo-whatsapp"
                    color={colors.whatsapp}
                  />
                  <Text
                    style={applyStyles(
                      'pl-xs text-xs text-400 text-uppercase text-gray-200',
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
                    size={16}
                    name="message-circle"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles(
                      'pl-xs text-xs text-400 text-uppercase text-gray-200',
                    )}>
                    sms
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
        <View
          style={applyStyles(
            'p-16 flex-row justify-between items-center bottom-0 absolute',
          )}>
          <Button
            onPress={() => {}}
            variantColor="green"
            style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('text-uppercase text-white text-700')}>
              You Collected
            </Text>
          </Button>
          <Button
            variantColor="red"
            onPress={() => {}}
            style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('text-uppercase text-white text-700')}>
              You Gave
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </CustomerContext.Provider>
  );
};

export default CustomerDetails;
