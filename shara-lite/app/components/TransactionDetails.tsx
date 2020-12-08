import {Button, ButtonProps, DatePicker} from '@/components';
import CustomerDetailsHeader, {
  CustomerDetailsHeaderProps,
} from '@/components/CustomerDetailsHeader';
import {Icon} from '@/components/Icon';
import PaymentReminderImage from '@/components/PaymentReminderImage';
import Touchable from '@/components/Touchable';
import {TransactionEntryContextProps} from '@/components/TransactionEntryView';
import TransactionListHeader from '@/components/TransactionListHeader';
import TransactionListItem from '@/components/TransactionListItem';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {
  getAnalyticsService,
  getAuthService,
  getContactService,
} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {ShareHookProps, useShare} from '@/services/share';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import Config from 'react-native-config';
import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, FlatList, SafeAreaView, Text, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useCustomer} from '@/services/customer/hook';

export type TransactionDetailsProps = {
  dueDate?: Date;
  isPaid?: boolean;
  customer?: ICustomer;
  creditAmount?: number;
  transactions?: IReceipt[];
  showActionButtons?: boolean;
  header?: Partial<CustomerDetailsHeaderProps>;
  sendReminder?: boolean;
  actionButtons?: ButtonProps[];
};

const TransactionDetails = withModal(
  ({
    header,
    creditAmount,
    transactions,
    actionButtons,
    isPaid = false,
    sendReminder = true,
    customer: customerProp,
    dueDate: creditDueDate,
    showActionButtons = true,
    openModal,
  }: TransactionDetailsProps & ModalWrapperFields) => {
    const analyticsService = getAnalyticsService();
    const businessInfo = getAuthService().getBusinessInfo();
    const {addCustomerToTransaction} = useTransaction();
    const {saveCustomer} = useCustomer();

    const [receiptImage, setReceiptImage] = useState('');
    const [customer, setCustomer] = useState(customerProp);
    const [dueDate, setDueDate] = useState<Date | undefined>(
      creditDueDate || undefined,
    );

    const paymentLink = `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}`;

    const paymentReminderMessage = `Hello ${
      customer?.name ?? ''
    }, thank you for doing business with ${
      businessInfo?.name
    }. You owe ${amountWithCurrency(
      creditAmount || customer?.remainingCreditAmount,
    )}${
      dueDate
        ? ` which is due on ${format(new Date(dueDate), 'MMM dd, yyyy')}`
        : ''
    }.\n\nTo pay click\n ${paymentLink}\n\nPowered by Shara for free.\nwww.shara.co`;

    const shareProps: ShareHookProps = {
      image: receiptImage,
      title: 'Payment Reminder',
      subject: 'Payment Reminder',
      recipient: customer?.mobile,
      message: paymentReminderMessage,
    };

    const {handleSmsShare, handleWhatsappShare} = useShare(shareProps);
    const {updateDueDate} = useTransaction();

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

    const handleDueDateChange = useCallback(
      async (date?: Date) => {
        if (date) {
          setDueDate(date);
          if (customer) {
            try {
              await updateDueDate({due_date: date, customer});
            } catch (e) {
              console.log(e);
            }
          }
        }
      },
      [customer, updateDueDate],
    );

    const handleAddCustomer = useCallback(async () => {
      try {
        const selection = await getContactService().selectContactPhone();
        if (!selection) {
          return;
        }
        const {contact, selectedPhone} = selection;
        const createCustomerPayload = {
          name: contact.name,
          mobile: selectedPhone.number,
          email: contact.emails[0]?.address,
        };
        const newCustomer = await saveCustomer({
          customer: createCustomerPayload,
        });
        setCustomer(newCustomer);
        if (transactions?.length) {
          await addCustomerToTransaction({
            customer: newCustomer,
            transaction: transactions[0],
          });
        }
      } catch (error) {
        handleError(error);
      }
    }, [saveCustomer, transactions, addCustomerToTransaction]);

    const renderTransactionItem = useCallback(
      ({item: transaction}: {item: IReceipt}) => {
        return <TransactionListItem transaction={transaction} />;
      },
      [],
    );
    const navigation = useAppNavigation();
    const {youGave, youGot} = useTransaction();
    actionButtons = useMemo(() => {
      if (!customer) {
        return [];
      }
      if (!actionButtons) {
        return [
          {
            onPress: () => {
              navigation.navigate('CustomerEntry', {
                onEntrySave: ({amount, note}: TransactionEntryContextProps) => {
                  navigation.goBack();
                  const closeLoadingModal = openModal('loading', {
                    text: 'Adding Transaction...',
                  });
                  youGot({
                    customer,
                    amount: amount?.value ?? 0,
                    note,
                  })
                    .catch(handleError)
                    .finally(closeLoadingModal);
                },
              });
            },
            variantColor: 'green',
            style: applyStyles('flex-1 mr-4'),
            children: (
              <Text style={applyStyles('text-uppercase text-white text-700')}>
                You Collected
              </Text>
            ),
          },
          {
            onPress: () => {
              navigation.navigate('CustomerEntry', {
                onEntrySave: ({amount, note}: TransactionEntryContextProps) => {
                  navigation.goBack();
                  const closeLoadingModal = openModal('loading', {
                    text: 'Adding Transaction...',
                  });
                  youGave({
                    customer,
                    amount: amount?.value ?? 0,
                    note,
                  })
                    .catch(handleError)
                    .finally(closeLoadingModal);
                },
              });
            },
            variantColor: 'red',
            style: applyStyles('flex-1 ml-4'),
            children: (
              <Text style={applyStyles('text-uppercase text-white text-700')}>
                You Gave
              </Text>
            ),
          },
        ];
      }
      return actionButtons;
    }, [actionButtons, customer, navigation, openModal, youGave, youGot]);

    return (
      <SafeAreaView style={applyStyles('flex-1')}>
        <CustomerDetailsHeader
          {...header}
          isPaid={isPaid}
          customer={customer}
          creditAmount={creditAmount}
          onPress={handleAddCustomer}
          style={applyStyles(
            {
              left: -14,
              borderBottomWidth: 0,
              width: Dimensions.get('window').width - 34,
            },
            header?.style,
          )}
        />
        {!!transactions?.length && (
          <>
            {!isPaid && (
              <View style={applyStyles('bg-white center py-16')}>
                <DatePicker
                  //@ts-ignore
                  minimumDate={new Date()}
                  value={dueDate ?? new Date()}
                  onChange={(e: Event, date?: Date) =>
                    handleDueDateChange(date)
                  }>
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
                {!!sendReminder && (
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
                )}
              </View>
            )}

            <FlatList
              data={transactions}
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
                date={dueDate}
                captureMode="update"
                getImageUri={(data) => setReceiptImage(data)}
                amount={creditAmount || customer?.remainingCreditAmount}
              />
            </View>
          </>
        )}
        {customer && !transactions?.length && (
          <View
            style={applyStyles(
              'center bg-gray-20 p-16 bottom-80 absolute w-full',
            )}>
            <Text style={applyStyles('pb-16 text-center text-700')}>
              Add first transaction for {customer?.name}
            </Text>
            <Animatable.View
              duration={200}
              animation={{
                from: {translateY: -10},
                to: {translateY: 0},
              }}
              direction="alternate"
              useNativeDriver={true}
              iterationCount="infinite">
              <Icon
                size={20}
                name="arrow-down"
                type="feathericons"
                color={colors.primary}
              />
            </Animatable.View>
          </View>
        )}
        {!!showActionButtons && (
          <View
            style={applyStyles(
              'p-16 w-full bg-white flex-row justify-center items-center bottom-0 absolute',
            )}>
            {actionButtons.map((actionButton) => (
              <Button {...actionButton} />
            ))}
          </View>
        )}
      </SafeAreaView>
    );
  },
);

export default TransactionDetails;
