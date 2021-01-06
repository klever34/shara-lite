import CustomerDetailsHeader, {
  CustomerDetailsHeaderProps,
} from '@/components/CustomerDetailsHeader';
import {Icon} from '@/components/Icon';
import PaymentReminderImage from '@/components/PaymentReminderImage';
import Touchable from '@/components/Touchable';
import TransactionListHeader from '@/components/TransactionListHeader';
import TransactionListItem from '@/components/TransactionListItem';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency, getCustomerWhatsappNumber} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {ReminderUnit, ReminderWhen} from '@/models/PaymentReminder';
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
import {usePaymentReminder} from '@/services/payment-reminder';
import {useReports} from '@/services/reports';
import {ShareHookProps, useShare} from '@/services/share';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  formatDistanceToNowStrict,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import React, {useCallback, useContext, useEffect, useState} from 'react';
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
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {EntryButton, EntryContext} from './EntryView';
import {TransactionFilterModal} from './TransactionFilterModal';

export type TransactionDetailsProps = {
  customer: ICustomer;
  transactions?: IReceipt[];
  header?: Partial<CustomerDetailsHeaderProps>;
};

const TransactionDetails = withModal(
  ({
    header,
    openModal,
    transactions,
    customer: customerProp,
  }: TransactionDetailsProps & ModalWrapperFields) => {
    const {saveCustomer} = useCustomer();
    const navigation = useAppNavigation();
    const user = getAuthService().getUser();
    const analyticsService = getAnalyticsService();
    const {getPaymentReminders} = usePaymentReminder();
    const {exportCustomerReportsToExcel} = useReports();
    const {addCustomerToTransaction} = useTransaction();
    const businessInfo = getAuthService().getBusinessInfo();
    const {
      filter,
      filterEndDate,
      filterOptions,
      filterStartDate,
      filteredReceipts,
      handleStatusFilter,
    } = useReceiptList({receipts: transactions});

    const [receiptImage, setReceiptImage] = useState('');
    const [customer, setCustomer] = useState(customerProp);
    const [isSharingStatement, setIsSharingStatment] = useState(false);
    const {due_date: dueDate} = customer;

    const {setCurrentCustomer} = useContext(EntryContext);

    useEffect(() => {
      setCurrentCustomer?.(customer);
    }, [customer, setCurrentCustomer]);

    const getNextReminderDateText = useCallback(() => {
      const dates: Date[] = [];
      if (dueDate) {
        getPaymentReminders().forEach((item) => {
          switch (item.unit) {
            case ReminderUnit.DAYS:
              if (item.when === ReminderWhen.AFTER) {
                dates.push(addDays(dueDate, item.amount));
              } else {
                dates.push(subDays(dueDate, item.amount));
              }
              break;
            case ReminderUnit.WEEKS:
              if (item.when === ReminderWhen.AFTER) {
                dates.push(addWeeks(dueDate, item.amount));
              } else {
                dates.push(subWeeks(dueDate, item.amount));
              }
              break;
            case ReminderUnit.MONTHS:
              if (item.when === ReminderWhen.AFTER) {
                dates.push(addMonths(dueDate, item.amount));
              } else {
                dates.push(subMonths(dueDate, item.amount));
              }
              break;

            default:
              break;
          }
        });
        if (dates.length) {
          return formatDistanceToNowStrict(dates[0], {
            addSuffix: true,
          });
        }
        return formatDistanceToNowStrict(addDays(dueDate, 1), {
          addSuffix: true,
        });
      }
    }, [dueDate, getPaymentReminders]);

    const whatsAppNumber = customer.mobile
      ? getCustomerWhatsappNumber(customer.mobile, user?.country_code)
      : '';

    const paymentLink =
      businessInfo.slug &&
      `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
        customer._id ? `?customer=${String(customer._id)}` : ''
      }`;

    const paymentReminderMessage = `Hello ${customer?.name ?? ''}${
      businessInfo?.name || user?.firstname
        ? `, thank you for doing business with ${
            businessInfo.name ?? user?.firstname
          }`
        : ''
    }. ${
      customer.balance && customer.balance < 0
        ? `You owe ${amountWithCurrency(customer.balance)}`
        : ''
    }${
      dueDate
        ? ` which is due on ${format(new Date(dueDate), 'MMM dd, yyyy')}`
        : ''
    }. ${
      paymentLink ? `\n\nTo pay click\n${paymentLink}` : ''
    }\n\nPowered by Shara for free.\nwww.shara.co`;

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

    const handleShareStatement = useCallback(async () => {
      try {
        setIsSharingStatment(true);
        const path = await exportCustomerReportsToExcel({
          receipts: filteredReceipts,
        });
        RNFetchBlob.fs
          .readFile(path, 'base64')
          .then(async (base64Data) => {
            base64Data =
              'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' +
              base64Data;
            const hasWhatsapp = await Share.isPackageInstalled('com.whatsapp');
            if (hasWhatsapp && whatsAppNumber) {
              setIsSharingStatment(false);
              await Share.shareSingle({
                //@ts-ignore
                whatsAppNumber,
                url: base64Data,
                social: Share.Social.WHATSAPP,
                title: 'Share Customer Statement',
                filename: `${customer ? customer.name : ''} Ledger Statement`,
                message: `Find attached your ledger statement from ${businessInfo.name}`,
              });
            } else {
              setIsSharingStatment(false);
              await Share.open({
                url: base64Data,
                title: 'Share Customer Statement',
                filename: `${customer ? customer.name : ''} Ledger Statement`,
                message: `Find attached your ledger statement from ${businessInfo.name}`,
              });
            }
          })
          .catch((error) => {
            setIsSharingStatment(false);
            handleError(error);
          });
        getAnalyticsService()
          .logEvent('userSharedReport', {})
          .then(() => {})
          .catch(handleError);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }, [
      customer,
      whatsAppNumber,
      filteredReceipts,
      businessInfo.name,
      exportCustomerReportsToExcel,
    ]);

    const handleClear = useCallback(() => {
      handleStatusFilter({
        status: 'all',
      });
    }, [handleStatusFilter]);

    const handleViewCustomer = useCallback(() => {
      requestAnimationFrame(() =>
        navigation.navigate('EditCustomer', {customer}),
      );
    }, [customer, navigation]);

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
        requestAnimationFrame(() =>
          navigation.navigate('LedgerEntry', {
            transaction,
            showCustomer: false,
          }),
        );
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

    return (
      <SafeAreaView style={applyStyles('flex-1')}>
        <CustomerDetailsHeader
          {...header}
          customer={customer}
          onPress={customer ? handleViewCustomer : handleAddCustomer}
          style={applyStyles(
            {
              left: -14,
              borderBottomWidth: 0,
              width: Dimensions.get('window').width - 34,
            },
            header?.style,
          )}
        />
        <View style={applyStyles('flex-1')}>
          {!!transactions?.length && (
            <>
              {!!customer?.balance && customer.balance < 0 ? (
                <View style={applyStyles('bg-white center pb-16 px-8')}>
                  {!!customer.balance && customer.balance < 0 && (
                    <View style={applyStyles('py-16 center')}>
                      <Text
                        style={applyStyles(
                          'text-uppercase text-gray-100 text-700 text-xs',
                        )}>
                        {customer?.name} has an outstanding of{' '}
                        <Text style={applyStyles('text-red-200')}>
                          {amountWithCurrency(customer.balance)}
                        </Text>
                      </Text>
                    </View>
                  )}
                  <Touchable
                    onPress={() =>
                      navigation.navigate('ReminderSettings', {customer})
                    }>
                    <View style={applyStyles('flex-row center py-8 flex-wrap')}>
                      <View
                        style={applyStyles(
                          `p-8 flex-row items-center ${
                            dueDate ? 'bg-white' : 'bg-red-200'
                          }`,
                          dueDate
                            ? {
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: colors['gray-50'],
                              }
                            : {borderRadius: 8},
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
                      {!!dueDate && !!getPaymentReminders().length ? (
                        <Text
                          style={applyStyles(
                            'pl-4 text-gray-100 text-uppercase text-700 text-xs',
                          )}>
                          Next reminder{' '}
                          <Text style={applyStyles('text-red-200')}>
                            {getNextReminderDateText()}
                          </Text>
                        </Text>
                      ) : (
                        <Text
                          style={applyStyles(
                            'pl-4 text-gray-100 text-uppercase text-700 text-xs',
                          )}>
                          No reminder set
                        </Text>
                      )}
                    </View>
                  </Touchable>
                  <View style={applyStyles('flex-row items-center flex-wrap')}>
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
                      ? `has a positive balance of ${amountWithCurrency(
                          customer.balance,
                        )}`
                      : 'is not owing'}
                  </Text>
                </View>
              )}
              <View
                style={applyStyles(
                  'py-8 px-16 flex-row items-center justify-between',
                )}>
                <Touchable
                  onPress={
                    isSharingStatement ? undefined : handleShareStatement
                  }>
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
                      {isSharingStatement
                        ? 'Generating Statement...'
                        : 'Share statement'}
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
                      style={applyStyles(
                        'text-gray-200 text-xs text-700 pr-8',
                      )}>
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

              {!!filter && filter !== 'all' && (
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
                      style={applyStyles(
                        'text-gray-50 text-700 text-uppercase',
                      )}>
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
                persistentScrollbar
                data={filteredReceipts}
                renderItem={renderTransactionItem}
                style={applyStyles('px-16 py-16 flex-1')}
                ListHeaderComponent={<TransactionListHeader />}
                keyExtractor={(item, index) =>
                  `${item?._id?.toString()}-${index}`
                }
                ListEmptyComponent={
                  <View style={applyStyles('center h-full')}>
                    <Text
                      style={applyStyles('pb-8 text-center text-400 text-lg')}>
                      No results found
                    </Text>
                    <Text style={applyStyles('text-black text-center text-lg')}>
                      Start adding records by tapping here
                    </Text>
                    <View style={applyStyles('center p-16 w-full')}>
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
                          size={100}
                          name="arrow-down"
                          type="feathericons"
                          color={colors.primary}
                        />
                      </Animatable.View>
                    </View>
                  </View>
                }
                ListFooterComponent={<View style={applyStyles({height: 50})} />}
              />
              <View style={applyStyles({opacity: 0, height: 0})}>
                <PaymentReminderImage
                  date={dueDate}
                  getImageUri={(data) => setReceiptImage(data)}
                  amount={customer.balance && Math.abs(customer.balance)}
                />
              </View>
            </>
          )}
        </View>
        {customer && !transactions?.length && (
          <View
            style={applyStyles(
              'center bg-gray-10 p-16 bottom-80 absolute w-full',
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
        <View style={applyStyles('center')}>
          <EntryButton />
        </View>
      </SafeAreaView>
    );
  },
);

export default TransactionDetails;
