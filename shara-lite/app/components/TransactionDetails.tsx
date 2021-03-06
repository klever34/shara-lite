import {Text} from '@/components';
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
import {ReminderUnit, ReminderWhen} from '@/models/PaymentReminder';
import {IReceipt} from '@/models/Receipt';
import {useReceiptList} from '@/screens/main/transactions/hook';
import {
  getAnalyticsService,
  getAuthService,
  getContactService,
  getI18nService,
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
import {Alert, Dimensions, FlatList, SafeAreaView, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Config from 'react-native-config';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';
import {EntryButton, EntryContext} from './EntryView';
import {TransactionFilterModal} from './TransactionFilterModal';
// TODO: Translate
const strings = getI18nService().strings;

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
    const {exportCustomerReportToPDF} = useReports();
    const {addCustomerToTransaction} = useTransaction();
    const businessInfo = getAuthService().getBusinessInfo();
    const {
      filter,
      filterEndDate,
      filterOptions,
      filterStartDate,
      filteredReceipts,
      handleStatusFilter,
      collectedAmount,
      totalAmount,
      outstandingAmount,
    } = useReceiptList({receipts: transactions});

    const [receiptImage, setReceiptImage] = useState('');
    const [customer, setCustomer] = useState(customerProp);
    const {due_date: dueDate} = customer;

    const {setCurrentCustomer} = useContext(EntryContext);

    useEffect(() => {
      setCurrentCustomer?.(customer);
    }, [customer, setCurrentCustomer]);

    const getNextReminderDateText = useCallback(() => {
      const dates: Date[] = [];
      if (dueDate) {
        getPaymentReminders({customer}).forEach((item) => {
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
    }, [dueDate, getPaymentReminders, customer]);

    const paymentLink =
      businessInfo.slug &&
      `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
        customer._id ? `?customer=${String(customer._id)}` : ''
      }`;

    const paymentReminderMessage = `${strings('salutation', {
      name: customer?.name ?? '',
    })} ${
      businessInfo?.name || user?.firstname
        ? strings('payment_reminder.thank_you_for_doing_business', {
            business_name: businessInfo?.name || user?.firstname,
          })
        : ''
    } ${
      customer.balance && customer.balance < 0
        ? dueDate
          ? strings('you_owe_message_with_due_date', {
              credit_amount: amountWithCurrency(customer.balance),
              due_date: format(new Date(dueDate), 'MMM dd, yyyy'),
            })
          : strings('you_owe_message', {
              credit_amount: amountWithCurrency(customer.balance),
            })
        : ''
    }\n\n${
      paymentLink
        ? strings('payment_link_message', {payment_link: paymentLink})
        : ''
    }\n\n${strings('powered_by_shara')}`;

    const shareProps: ShareHookProps = {
      image: receiptImage,
      title: strings('payment_reminder.title'),
      subject: strings('payment_reminder.title'),
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
            <Text style={applyStyles('text-gray-300 text-400')}>
              {strings('from')}
            </Text>{' '}
            <Text style={applyStyles('text-red-200 text-400')}>
              {format(filterStartDate, 'dd MMM, yyyy')}
            </Text>{' '}
            <Text style={applyStyles('text-gray-300 text-400')}>
              {strings('to')}
            </Text>{' '}
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

    const getReportFilterRange = useCallback(() => {
      if (filter === 'all') {
        return `${format(
          filteredReceipts[filteredReceipts.length - 1]?.transaction_date ??
            new Date(),
          'dd MMM, yyyy',
        )} - ${format(
          filteredReceipts[0]?.transaction_date ?? new Date(),
          'dd MMM, yyyy',
        )}`;
      }
      if (filter === 'single-day') {
        return format(filterStartDate, 'dd MMM, yyyy');
      }
      return `${format(filterStartDate, 'dd MMM, yyyy')} - ${format(
        filterEndDate,
        'dd MMM, yyyy',
      )}`;
    }, [filterStartDate, filterEndDate, filter, filteredReceipts]);

    const handlePreviewStatement = useCallback(async (pdfFilePath) => {
      try {
        await FileViewer.open(pdfFilePath, {showOpenWithDialog: true});
      } catch (error) {
        handleError(error);
      }
    }, []);

    const handleShareStatement = useCallback(
      async (pdfBase64String) => {
        try {
          await Share.open({
            url: pdfBase64String,
            title: strings('customer_statement.title'),
            filename: strings('customer_statement.filename', {
              customer_name: customer ? customer.name : '',
            }),
            message: strings('customer_statement.message', {
              business_name: businessInfo.name,
            }),
          });
          getAnalyticsService()
            .logEvent('userSharedReport', {})
            .then(() => {})
            .catch(handleError);
        } catch (error) {
          handleError(error);
        }
      },
      [customer, businessInfo.name],
    );

    const handleOpenOptionsModal = useCallback(
      ({pdfFilePath, pdfBase64String}) => {
        openModal('options', {
          options: [
            {
              text: strings('transaction.share_customer_ledger_text'),
              onPress: () => handleShareStatement(pdfBase64String),
            },
            {
              text: strings('transaction.view_customer_ledger_text'),
              onPress: () => handlePreviewStatement(pdfFilePath),
            },
          ],
        });
      },
      [openModal, handleShareStatement, handlePreviewStatement],
    );

    const handleGenerateStatement = useCallback(async () => {
      const closeModal = openModal('loading', {text: 'Generating report...'});
      try {
        let {pdfFilePath, pdfBase64String} = await exportCustomerReportToPDF({
          customer,
          totalAmount,
          collectedAmount,
          outstandingAmount,
          businessName: businessInfo.name,
          filterRange: getReportFilterRange(),
          data: filteredReceipts.sorted('created_at', false),
        });
        pdfBase64String = 'data:application/pdf;base64,' + pdfBase64String;
        closeModal();
        handleOpenOptionsModal({pdfFilePath, pdfBase64String});
      } catch (error) {
        closeModal();
        handleError(error);
        Alert.alert('Error', error.message);
      }
    }, [
      customer,
      openModal,
      totalAmount,
      collectedAmount,
      filteredReceipts,
      businessInfo.name,
      outstandingAmount,
      getReportFilterRange,
      handleOpenOptionsModal,
      exportCustomerReportToPDF,
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

    const handleGoToReminderSettings = useCallback(() => {
      requestAnimationFrame(() =>
        navigation.navigate('ReminderSettings', {customer}),
      );
    }, [navigation, customer]);

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
                        {customer?.name} {strings('outstanding_text')}{' '}
                        <Text style={applyStyles('text-red-200')}>
                          {amountWithCurrency(customer.balance)}
                        </Text>
                      </Text>
                    </View>
                  )}
                  <Touchable onPress={handleGoToReminderSettings}>
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
                            ? strings('transaction.on_$date', {
                                date: format(dueDate, 'ccc, dd MMM yyyy'),
                              })
                            : strings('transaction.set_collection_date')}
                        </Text>
                      </View>
                      {!!dueDate && !!getPaymentReminders({customer}).length ? (
                        <Text
                          style={applyStyles(
                            'pl-8 text-gray-100 text-uppercase text-700 text-xs',
                          )}>
                          Next reminder{' '}
                          <Text style={applyStyles('text-red-200')}>
                            {getNextReminderDateText()}
                          </Text>
                        </Text>
                      ) : (
                        <Text
                          style={applyStyles(
                            'pl-8 text-gray-100 text-uppercase text-700 text-xs',
                          )}>
                          {strings('transaction.no_reminder_set')}
                        </Text>
                      )}
                    </View>
                  </Touchable>
                  <View style={applyStyles('flex-row items-center flex-wrap')}>
                    <Text
                      style={applyStyles(
                        'text-sm text-uppercase text-gray-300 text-700',
                      )}>
                      {strings('transaction.send_reminder')}:
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
                            {strings('whatsapp')}
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
                            {strings('sms')}
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
                            color={colors['green-100']}
                          />
                          <Text
                            style={applyStyles(
                              'pl-xs text-xs text-400 text-uppercase text-gray-200',
                            )}>
                            {strings('other', {count: 1})}
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
                    {customer?.balance && customer?.balance > 0
                      ? strings('transaction.balance_statement', {
                          customer_name: customer?.name,
                          balance: amountWithCurrency(customer.balance),
                        })
                      : strings('transaction.not_owing', {
                          customer_name: customer?.name,
                        })}
                  </Text>
                </View>
              )}
              <View
                style={applyStyles(
                  'py-8 px-16 flex-row items-center justify-between',
                )}>
                <Touchable onPress={handleGenerateStatement}>
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
                      {strings('transaction.share_statement')}
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
                      {strings('filter', {count: 2})}
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
                      {strings('filter', {count: 1})}:{' '}
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
                        {strings('clear')}
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
                      {strings('no_result_found')}
                    </Text>
                    <Text style={applyStyles('text-black text-center text-lg')}>
                      {strings('transaction.start_here')}
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
              {strings('transaction.add_first', {
                customer_name: customer?.name,
              })}
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
