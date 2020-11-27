import {Button, DatePicker} from '@/components';
import CustomerDetailsHeader from '@/components/CustomerDetailsHeader';
import {Icon} from '@/components/Icon';
import PaymentReminderImage from '@/components/PaymentReminderImage';
import Touchable from '@/components/Touchable';
import TransactionListHeader from '@/components/TransactionListHeader';
import TransactionListItem from '@/components/TransactionListItem';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {CustomersStackParamList} from '@/screens/main/customers';
import {getAnalyticsService, getAuthService} from '@/services';
import {CustomerContext} from '@/services/customer';
import {useAppNavigation} from '@/services/navigation';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {format} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, FlatList, SafeAreaView, Text, View} from 'react-native';
import {MainStackParamList} from '..';

type CustomerDetailsProps = {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerDetails'
  >;
};

const CustomerDetails = ({route}: CustomerDetailsProps) => {
  const navigation = useAppNavigation();
  const analyticsService = getAnalyticsService();
  const businessInfo = getAuthService().getBusinessInfo();

  const {customer} = route.params;
  const credit = customer?.credits && customer.credits[0];
  const creditDueDate = credit?.due_date;

  const [receiptImage, setReceiptImage] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    creditDueDate || undefined,
  );

  const receipt = {} as IReceipt;
  const totalAmountPaid = 0;
  const creditAmountLeft = customer?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );

  const paymentReminderMessage = `Hello ${
    customer?.name ?? ''
  }, thank you for your recent purchase from ${
    businessInfo?.name
  } for ${amountWithCurrency(
    receipt?.total_amount,
  )}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
    dueDate ? format(new Date(dueDate), 'MMM dd, yyyy') : ''
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nwww.shara.co`;

  const shareProps: ShareHookProps = {
    image: receiptImage,
    title: 'Payment Reminder',
    subject: 'Payment Reminder',
    recipient: customer?.mobile,
    message: paymentReminderMessage,
  };

  const {handleSmsShare, handleWhatsappShare} = useShare(shareProps);

  const onSmsShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'sms',
        content_type: 'payment-reminder',
        item_id: receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleSmsShare();
  }, [analyticsService, handleSmsShare, receipt]);

  const onWhatsappShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'whatsapp',
        content_type: 'payment-reminder',
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

  const renderTransactionItem = useCallback(
    ({item: transaction}: {item: IReceipt}) => {
      return <TransactionListItem transaction={transaction} />;
    },
    [],
  );

  const filteredReceipts = useMemo(() => {
    return customer.receipts?.sorted('created_at', true);
  }, [customer.receipts]);

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
          <CustomerDetailsHeader
            customer={customer}
            style={applyStyles({
              left: -14,
              borderBottomWidth: 0,
              width: Dimensions.get('window').width - 34,
            })}
          />
        </View>
        {filteredReceipts?.length && (
          <>
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
            <FlatList
              data={filteredReceipts}
              renderItem={renderTransactionItem}
              style={applyStyles('px-16 py-16 flex-1')}
              ListHeaderComponent={<TransactionListHeader />}
              keyExtractor={(item, index) =>
                `${item?._id?.toString()}-${index}`
              }
              ListFooterComponent={<View style={applyStyles({height: 200})} />}
            />
            <View style={applyStyles({opacity: 0, height: 0})}>
              <PaymentReminderImage
                amount={1000}
                date={dueDate}
                captureMode="update"
                getImageUri={(data) => setReceiptImage(data)}
              />
            </View>
          </>
        )}
        <View
          style={applyStyles(
            'p-16 w-full bg-white flex-row justify-between items-center bottom-0 absolute',
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
