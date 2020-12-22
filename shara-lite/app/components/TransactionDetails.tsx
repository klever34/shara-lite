import {Button, ButtonProps} from '@/components';
import CustomerDetailsHeader, {
  CustomerDetailsHeaderProps,
} from '@/components/CustomerDetailsHeader';
import {Icon} from '@/components/Icon';
import PaymentReminderImage from '@/components/PaymentReminderImage';
import Touchable from '@/components/Touchable';
import TransactionListHeader from '@/components/TransactionListHeader';
import TransactionListItem from '@/components/TransactionListItem';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {useReceiptList} from '@/screens/main/transactions/hook';
import {
  getAnalyticsService,
  getAuthService,
  getContactService,
} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {ShareHookProps, useShare} from '@/services/share';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Config from 'react-native-config';
import {TransactionFilterModal} from './TransactionFilterModal';

export type TransactionDetailsProps = {
  dueDate?: Date;
  isPaid?: boolean;
  customer?: ICustomer;
  creditAmount?: number;
  sendReminder?: boolean;
  transactions?: IReceipt[];
  showActionButtons?: boolean;
  actionButtons?: ButtonProps[];
  header?: Partial<CustomerDetailsHeaderProps>;
};

const TransactionDetails = withModal(
  ({
    header,
    isPaid,
    dueDate,
    openModal,
    creditAmount,
    transactions,
    actionButtons,
    customer: customerProp,
    showActionButtons = true,
  }: TransactionDetailsProps & ModalWrapperFields) => {
    const {saveCustomer} = useCustomer();
    const navigation = useAppNavigation();
    const analyticsService = getAnalyticsService();
    const {addCustomerToTransaction} = useTransaction();
    const businessInfo = getAuthService().getBusinessInfo();
    const {
      filter,
      filterEndDate,
      filterOptions,
      filterStartDate,
      handleStatusFilter,
    } = useReceiptList({receipts: transactions});

    const [receiptImage, setReceiptImage] = useState('');
    const [customer, setCustomer] = useState(customerProp);

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

    const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
      shareProps,
    );

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

    const onOthersShare = useCallback(() => {
      analyticsService
        .logEvent('share', {
          method: 'others',
          content_type: 'payment-reminder',
          item_id: '',
        })
        .then(() => {});
      handleEmailShare();
    }, [analyticsService, handleEmailShare]);

    const handleOpenFilterModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <TransactionFilterModal
            onClose={closeModal}
            initialFilter={filter}
            options={filterOptions}
            onDone={handleStatusFilter}
          />
        ),
      });
    }, [filter, filterOptions, openModal, handleStatusFilter]);

    const handleDownloadReport = useCallback(() => {
      Alert.alert('Info', 'This feature is coming soon');
    }, []);

    const handleClear = useCallback(() => {
      handleStatusFilter({
        status: 'all',
      });
    }, [handleStatusFilter]);

    const getFilterLabelText = useCallback(() => {
      const activeOption = filterOptions?.find((item) => item.value === filter);
      if (filter === 'date-range' && filterStartDate && filterEndDate) {
        return (
          <Text>
            <Text style={applyStyles('text-gray-300 text-400')}>From</Text>{' '}
            <Text style={applyStyles('text-red-200 text-400')}>
              {format(filterStartDate, 'dd MMM, yyyy')}
            </Text>{' '}
            <Text style={applyStyles('text-gray-300 text-400')}>to</Text>{' '}
            <Text style={applyStyles('text-red-200 text-400')}>
              {format(filterEndDate, 'dd MMM, yyyy')}
            </Text>
          </Text>
        );
      }
      return (
        <Text style={applyStyles('text-red-200 text-400 text-capitalize')}>
          {activeOption?.text}
        </Text>
      );
    }, [filter, filterEndDate, filterOptions, filterStartDate]);

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
          source: 'phonebook',
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

    const handleLedgerItemSelect = useCallback(
      (transaction: IReceipt) => {
        getAnalyticsService()
          .logEvent('selectContent', {
            content_type: 'transaction',
            item_id: transaction?._id?.toString() ?? '',
          })
          .then(() => {});
        navigation.navigate('LedgerEntry', {transaction, showCustomer: false});
      },
      [navigation],
    );

    const renderTransactionItem = useCallback(
      ({item: transaction}: {item: IReceipt}) => {
        return (
          <TransactionListItem
            transaction={transaction}
            onPress={() => handleLedgerItemSelect(transaction)}
          />
        );
      },
      [handleLedgerItemSelect],
    );

    actionButtons = useMemo(() => {
      if (!customer) {
        return [];
      }
      if (!actionButtons) {
        return [
          {
            onPress: () => {
              navigation.navigate('CustomerEntry', {
                onEntrySave: () => {
                  navigation.goBack();
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
                onEntrySave: () => {
                  navigation.goBack();
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
    }, [actionButtons, customer, navigation]);

    return (
      <SafeAreaView style={applyStyles('flex-1')}>
        <CustomerDetailsHeader
          {...header}
          isPaid={isPaid}
          customer={customer}
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
            {customer?.balance && customer?.balance < 0 ? (
              <View style={applyStyles('bg-white center pb-16')}>
                <View style={applyStyles('py-16 center')}>
                  <Text
                    style={applyStyles(
                      'text-uppercase text-gray-100 text-700 text-xs',
                    )}>
                    {customer?.name} owes you{' '}
                    <Text style={applyStyles('text-red-200')}>
                      {amountWithCurrency(customer.balance)}
                    </Text>
                  </Text>
                </View>
                <Touchable
                  onPress={() =>
                    navigation.navigate('ReminderSettings', {customer})
                  }>
                  <View style={applyStyles('flex-row center p-8')}>
                    <View
                      style={applyStyles(
                        `p-8 flex-row items-center ${
                          dueDate ? 'bg-white' : 'bg-red-200'
                        }`,
                        {borderRadius: 8},
                      )}>
                      <Icon
                        size={16}
                        name="calendar"
                        type="feathericons"
                        color={dueDate ? colors['red-200'] : colors['red-50']}
                      />
                      <Text
                        style={applyStyles(
                          `pl-sm text-xs text-uppercase text-700 ${
                            dueDate ? 'text-gray-300' : 'text-white'
                          }`,
                        )}>
                        {dueDate
                          ? `on ${format(dueDate, 'ccc, dd MMM yyyy')}`
                          : 'set collection date'}
                      </Text>
                    </View>
                    <Text
                      style={applyStyles(
                        'pl-4 text-gray-100 text-uppercase text-700 text-xs',
                      )}>
                      No reminder set
                    </Text>
                  </View>
                </Touchable>
                <View style={applyStyles('flex-row items-center')}>
                  <Text
                    style={applyStyles(
                      'text-sm text-uppercase text-gray-300 text-700',
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
                  <View style={applyStyles('px-4')}>
                    <Touchable onPress={onOthersShare}>
                      <View
                        style={applyStyles('px-2 flex-row center', {
                          height: 48,
                        })}>
                        <Icon
                          size={16}
                          type="feathericons"
                          name="more-vertical"
                          color={colors['red-100']}
                        />
                        <Text
                          style={applyStyles(
                            'pl-xs text-xs text-400 text-uppercase text-gray-200',
                          )}>
                          other
                        </Text>
                      </View>
                    </Touchable>
                  </View>
                </View>
              </View>
            ) : (
              <View style={applyStyles('p-16 center')}>
                <Text
                  style={applyStyles(
                    'text-uppercase text-gray-100 text-700 text-xs',
                  )}>
                  {customer?.name}{' '}
                  {customer?.balance && customer?.balance > 0
                    ? `has ${amountWithCurrency(customer.balance)} with you`
                    : 'is not owing'}
                </Text>
              </View>
            )}
            <View
              style={applyStyles(
                'py-8 px-16 flex-row items-center justify-between',
              )}>
              <Touchable onPress={handleDownloadReport}>
                <View
                  style={applyStyles(
                    'py-4 px-8 flex-row items-center bg-gray-20',
                    {
                      borderWidth: 1,
                      borderRadius: 16,
                      borderColor: colors['gray-20'],
                    },
                  )}>
                  <Icon
                    size={16}
                    name="clipboard"
                    type="feathericons"
                    color={colors['gray-50']}
                  />
                  <Text
                    style={applyStyles(
                      'text-gray-200 text-700 text-xxs pl-8 text-uppercase',
                    )}>
                    Share statement
                  </Text>
                </View>
              </Touchable>
              <Touchable onPress={handleOpenFilterModal}>
                <View
                  style={applyStyles('py-4 px-8 flex-row items-center', {
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: colors['gray-20'],
                  })}>
                  <Text
                    style={applyStyles('text-gray-200 text-xs text-700 pr-8')}>
                    Filters
                  </Text>
                  <Icon
                    size={16}
                    name="calendar"
                    type="feathericons"
                    color={colors['gray-50']}
                  />
                </View>
              </Touchable>
            </View>

            {filter && filter !== 'all' && (
              <View
                style={applyStyles(
                  'py-8 px-16 flex-row items-center justify-between',
                  {
                    borderTopWidth: 1.5,
                    borderBottomWidth: 1.5,
                    borderTopColor: colors['gray-20'],
                    borderBottomColor: colors['gray-20'],
                  },
                )}>
                <View style={applyStyles('flex-row items-center flex-1')}>
                  <Text
                    style={applyStyles('text-gray-50 text-700 text-uppercase')}>
                    Filter:{' '}
                  </Text>
                  <View style={applyStyles('flex-1')}>
                    {getFilterLabelText()}
                  </View>
                </View>
                <Touchable onPress={handleClear}>
                  <View
                    style={applyStyles(
                      'py-4 px-8 flex-row items-center bg-gray-20',
                      {
                        borderWidth: 1,
                        borderRadius: 24,
                        borderColor: colors['gray-20'],
                      },
                    )}>
                    <Text
                      style={applyStyles(
                        'text-xs text-gray-200 text-700 text-uppercase pr-8',
                      )}>
                      Clear
                    </Text>
                    <Icon
                      name="x"
                      size={16}
                      type="feathericons"
                      color={colors['gray-50']}
                    />
                  </View>
                </Touchable>
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
