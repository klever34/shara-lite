import {
  BluetoothModal,
  CancelReceiptModal,
  ContactsListModal,
  Header,
  PreviewActionButton,
  ReceiptTableFooterItem,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
} from '@/components/';
import {Icon} from '@/components/Icon';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {withModal} from '@/helpers/hocs';
import {amountWithCurrency, numberWithCommas} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {
  getAnalyticsService,
  getAuthService,
  getStorageService,
} from '@/services';
import {getCustomers, saveCustomer} from '@/services/customer';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {
  cancelReceipt,
  getAllPayments,
  getReceipt,
  updateReceipt,
} from '@/services/ReceiptService';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager, //@ts-ignore
} from 'react-native-bluetooth-escpos-printer';
import {ReceiptListItem} from './ReceiptListItem';

export const ReceiptDetailsScreen = withModal(({route, openModal}: any) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const customers = getCustomers({realm});
  const user = getAuthService().getUser();
  const storageService = getStorageService();
  const analyticsService = getAnalyticsService();
  const currencyCode = getAuthService().getUserCurrencyCode();

  const [receiptImage, setReceiptImage] = useState('');
  const [receipt, setReceipt] = useState<IReceipt | undefined>();
  const [printer, setPrinter] = useState<{address: string}>(
    {} as {address: string},
  );
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    receipt?.customer,
  );
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [isCancelReceiptModalOpen, setIsCancelReceiptModalOpen] = useState(
    false,
  );

  const creditDueDate = receipt?.dueDate;
  const receiptDate = receipt?.created_at ?? new Date();
  const businessInfo = getAuthService().getBusinessInfo();
  const hasCustomerMobile = customer?.mobile;
  const allPayments = receipt ? getAllPayments({receipt}) : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  const creditAmountLeft = receipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );
  const isFulfilled = receipt?.total_amount === totalAmountPaid;

  const paymentReminderMessage = `Hello, you purchased some items from ${
    businessInfo?.name
  } for ${amountWithCurrency(
    receipt?.total_amount,
  )}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} which is due on ${
    creditDueDate ? format(new Date(creditDueDate), 'MMM dd, yyyy') : ''
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nwww.shara.co`;

  const receiptShareMessage = `Hi ${
    customer?.name ?? ''
  }, thank you for your recent purchase of ${
    receipt?.items?.length
  } item(s) from ${businessInfo.name}. You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)}${
    creditDueDate
      ? ` (which is due on ${format(new Date(creditDueDate), 'MMM dd, yyyy')})`
      : ''
  }. Thank you.\n\nPowered by Shara for free.\nwww.shara.co`;

  const shareProps: ShareHookProps = {
    image: receiptImage,
    recipient: receipt?.customer?.mobile,
    title: isFulfilled ? 'Share Receipt' : 'Payment Reminder',
    subject: isFulfilled ? 'Share Receipt' : 'Payment Reminder',
    message: isFulfilled ? receiptShareMessage : paymentReminderMessage,
  };

  const {handleSmsShare, handleEmailShare, handleWhatsappShare} = useShare(
    shareProps,
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

  const onEmailShare = useCallback(() => {
    analyticsService
      .logEvent('share', {
        method: 'email',
        content_type: 'debit-reminder',
        item_id: receipt?._id?.toString() ?? '',
      })
      .then(() => {});
    handleEmailShare();
  }, [analyticsService, receipt, handleEmailShare]);

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

  const handleSetCustomer = useCallback(
    (value?: ICustomer, callback?: () => void) => {
      if (customers.map((item) => item.mobile).includes(value?.mobile)) {
        const newCustomer = customers.find(
          (item) => item.mobile === value?.mobile,
        );
        setCustomer(newCustomer);
        receipt &&
          newCustomer &&
          updateReceipt({
            realm,
            receipt,
            customer: newCustomer,
          });
      } else {
        const newCustomer = value && saveCustomer({realm, customer: value});
        setCustomer(newCustomer);
        receipt &&
          newCustomer &&
          updateReceipt({
            realm,
            receipt,
            customer: newCustomer,
          });
      }
      callback && callback();
    },
    [customers, realm, receipt],
  );

  const renderItem = useCallback(
    ({item}: ReceiptTableItemProps) => <ReceiptTableItem item={item} />,
    [],
  );

  const handleOpenPrinterModal = useCallback(() => {
    setIsPrintingModalOpen(true);
  }, []);

  const handleClosePrinterModal = useCallback(() => {
    setIsPrintingModalOpen(false);
  }, []);

  const handlePrint = useCallback(
    async (address?: string, useSavedPrinter?: boolean) => {
      const productListColumnWidth = [22, 5, 15];
      try {
        const savedPrinterAddress = printer ? printer.address : '';
        const printerAddressToUse = useSavedPrinter
          ? savedPrinterAddress
          : address;
        const customerText = customer?.name
          ? `Receipt for: ${customer.name}`
          : 'No customer';
        await BluetoothManager.connect(printerAddressToUse);
        const receiptStyles = {
          header: {
            widthtimes: 1,
            heigthtimes: 1,
            fonttype: 1,
          },
          subheader: {
            widthtimes: 1,
            heigthtimes: 1,
            fonttype: 1,
          },
          product: {
            widthtimes: 0,
            heigthtimes: 0,
            fonttype: 1,
          },
        };
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        businessInfo.name &&
          (await BluetoothEscposPrinter.printText(
            `${businessInfo.name}\n`,
            receiptStyles.header,
          ));
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        businessInfo.address &&
          (await BluetoothEscposPrinter.printText(
            `${businessInfo.address}\n`,
            {},
          ));
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        businessInfo.name &&
          (await BluetoothEscposPrinter.printText(
            `Tel: ${businessInfo.mobile || user?.mobile}\n`,
            {},
          ));
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printText(`${customerText}\n`, {});
        await BluetoothEscposPrinter.printText(
          `Date: ${format(receiptDate, 'dd/MM/yyyy, hh:mm:a')}\n`,
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printColumn(
          productListColumnWidth,
          [
            BluetoothEscposPrinter.ALIGN.LEFT,
            BluetoothEscposPrinter.ALIGN.CENTER,
            BluetoothEscposPrinter.ALIGN.RIGHT,
          ],
          ['Description', 'QTY', `SubTotal(${currencyCode})`],
          receiptStyles.product,
        );
        for (const item of receipt?.items ?? []) {
          const p = item.price;
          const q = item.quantity;
          const total = p * q;
          await BluetoothEscposPrinter.printColumn(
            productListColumnWidth,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.CENTER,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            [`${item.product.name}`, `${q}`, `${numberWithCommas(total)}`],
            receiptStyles.product,
          );
        }
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.RIGHT,
        );
        await BluetoothEscposPrinter.printText(`Tax: ${0}\n`, {});
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.RIGHT,
        );
        await BluetoothEscposPrinter.printText(
          `Total: ${currencyCode} ${numberWithCommas(receipt?.total_amount)}\n`,
          {},
        );
        await BluetoothEscposPrinter.printText(
          `Paid: ${currencyCode} ${numberWithCommas(totalAmountPaid)}\n`,
          {},
        );
        creditAmountLeft &&
          (await BluetoothEscposPrinter.printText(
            `Balance: ${currencyCode} ${numberWithCommas(creditAmountLeft)}\n`,
            {},
          ));
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText(
          'Free receipting by Shara. www.shara.co\n',
          receiptStyles.product,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText('\n\r', {});
        getAnalyticsService()
          .logEvent('print', {
            item_id: '',
            content_type: 'receipt',
          })
          .then(() => {});
        handleClosePrinterModal();
      } catch (err) {
        ToastAndroid.show(err.toString(), ToastAndroid.SHORT);
        handleOpenPrinterModal();
      }
    },
    [
      receiptDate,
      printer,
      customer,
      businessInfo.name,
      businessInfo.address,
      businessInfo.mobile,
      user,
      currencyCode,
      receipt,
      totalAmountPaid,
      creditAmountLeft,
      handleClosePrinterModal,
      handleOpenPrinterModal,
    ],
  );

  const handlePrintReceipt = useCallback(() => {
    if (printer) {
      handlePrint(undefined, true);
    } else {
      handleOpenPrinterModal();
    }
  }, [handleOpenPrinterModal, handlePrint, printer]);

  const handleReissueReceipt = useCallback(() => {}, []);

  const handleCancelReceipt = useCallback(
    (note) => {
      setTimeout(() => {
        receipt && cancelReceipt({realm, receipt, cancellation_reason: note});
        setIsCancelReceiptModalOpen(false);
        navigation.goBack();
        ToastAndroid.show('Receipt cancelled', ToastAndroid.SHORT);
      }, 300);
    },
    [receipt, realm, navigation],
  );

  const handleEditReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
  }, []);

  const handleOpenContactList = useCallback(() => {
    const closeContactListModal = openModal('bottom-half', {
      swipeDirection: [],
      renderContent: () => (
        <ContactsListModal<ICustomer>
          entity="Customer"
          onClose={closeContactListModal}
          createdData={(customers as unknown) as ICustomer[]}
          onAddNew={() => navigation.navigate('AddCustomer')}
          onContactSelect={(data) =>
            handleSetCustomer(data, closeContactListModal)
          }
        />
      ),
    });
  }, [customers, handleSetCustomer, navigation, openModal]);

  const receiptActions = [
    {
      label: 'Cancel',
      icon: 'x-circle',
      onPress: () => setIsCancelReceiptModalOpen(true),
    },
    {label: 'Reissue', icon: 'refresh-cw', onPress: handleReissueReceipt},
    {label: 'Edit', icon: 'edit', onPress: handleEditReceipt},
    {label: 'Print', icon: 'printer', onPress: handlePrintReceipt},
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const receiptId = route.params.id;
      const retrievedRecipt = getReceipt({realm, receiptId});
      setReceipt(retrievedRecipt);
    });
    return unsubscribe;
  }, [realm, navigation, route.params.id]);

  useEffect(() => {
    const fetchPrinter = async () => {
      const savedPrinter = (await storageService.getItem('printer')) as {
        address: string;
      };
      setPrinter(savedPrinter);
    };
    fetchPrinter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPrintingModalOpen]);

  useEffect(() => {
    setCustomer(receipt?.customer);
  }, [receipt]);

  return !receipt ? (
    <View style={applyStyles('flex-1 center bg-white')}>
      <ActivityIndicator color={colors.primary} size={40} />
    </View>
  ) : (
    <>
      <Header
        title="View Receipt"
        iconLeft={{iconName: 'arrow-left', onPress: () => navigation.goBack()}}
      />
      <View style={applyStyles('bg-white flex-1')}>
        <ReceiptListItem
          isHeader
          receipt={receipt}
          onPress={receipt.hasCustomer ? undefined : handleOpenContactList}
        />
        <FlatList
          persistentScrollbar
          data={receipt.items}
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={<ReceiptTableHeader />}
          keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        />
        <>
          <View>
            <ReceiptTableFooterItem
              title="Total"
              value={amountWithCurrency(receipt.total_amount)}
            />
            <ReceiptTableFooterItem
              title="Paid"
              value={amountWithCurrency(totalAmountPaid)}
            />
            {!isFulfilled && (
              <ReceiptTableFooterItem
                title="Balance"
                value={amountWithCurrency(creditAmountLeft)}
              />
            )}
          </View>
          {!receipt?.is_cancelled && (
            <View
              style={applyStyles(
                'pt-8 pb-8 flex-row w-full justify-space-between flex-wrap',
                {
                  borderTopWidth: 1,
                  borderTopColor: colors['gray-10'],
                },
              )}>
              {receiptActions.map((item, index) => (
                <View
                  key={index.toString()}
                  style={applyStyles('center', {width: '25%'})}>
                  <PreviewActionButton {...item} />
                </View>
              ))}
            </View>
          )}
          {!!receipt?.note && (
            <View
              style={applyStyles('px-16 py-8', {
                borderTopWidth: 1,
                borderTopColor: colors['gray-10'],
              })}>
              <Text
                style={applyStyles(
                  'pb-4 text-700 text-uppercase text-xs text-gray-100',
                )}>
                Notes
              </Text>
              <Text style={applyStyles('text-400 text-sm text-gray-300')}>
                {receipt?.note}
              </Text>
            </View>
          )}
          {!!receipt?.is_cancelled && (
            <View
              style={applyStyles('px-16 py-8', {
                borderTopWidth: 1,
                borderTopColor: colors['gray-10'],
              })}>
              <Text
                style={applyStyles(
                  'pb-4 text-700 text-uppercase text-xs text-gray-100',
                )}>
                Cancellation Reason
              </Text>
              <Text style={applyStyles('text-400 text-sm text-gray-300')}>
                {receipt?.cancellation_reason}
              </Text>
            </View>
          )}

          {!receipt?.is_cancelled && (
            <View
              style={applyStyles('w-full py-16 px-24 bg-white', {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.34,
                shadowRadius: 6.27,
                elevation: 10,
              })}>
              <Text
                style={applyStyles(
                  'text-center text-700 text-gray-200 text-uppercase',
                )}>
                {isFulfilled ? 'Send via' : 'Send reminder'}
              </Text>
              <View
                style={applyStyles(
                  'flex-row w-full items-center justify-space-between flex-wrap',
                )}>
                {hasCustomerMobile && (
                  <View style={applyStyles('center', {width: '33%'})}>
                    <Touchable onPress={onWhatsappShare}>
                      <View
                        style={applyStyles('w-full', 'flex-row', 'center', {
                          height: 48,
                        })}>
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
                {hasCustomerMobile && (
                  <View style={applyStyles('center', {width: '33%'})}>
                    <Touchable onPress={onSmsShare}>
                      <View
                        style={applyStyles('w-full', 'flex-row', 'center', {
                          height: 48,
                        })}>
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
                <View style={applyStyles('center', {width: '33%'})}>
                  <Touchable onPress={onEmailShare}>
                    <View
                      style={applyStyles('w-full', 'flex-row', 'center', {
                        height: 48,
                      })}>
                      <Icon
                        size={24}
                        name="menu"
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
                        others
                      </Text>
                    </View>
                  </Touchable>
                </View>
              </View>
            </View>
          )}
        </>
      </View>

      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          user={user}
          tax={receipt?.tax}
          products={receipt?.items}
          amountPaid={totalAmountPaid}
          creditDueDate={creditDueDate}
          creditAmount={creditAmountLeft}
          createdAt={receipt?.created_at}
          totalAmount={receipt?.total_amount}
          isCancelled={receipt?.is_cancelled}
          customer={customer || receipt?.customer}
          getImageUri={(data) => setReceiptImage(data)}
        />
      </View>

      <BluetoothModal
        visible={isPrintingModalOpen}
        onPrintReceipt={handlePrint}
        onClose={handleClosePrinterModal}
      />
      <CancelReceiptModal
        isVisible={isCancelReceiptModalOpen}
        onCancelReceipt={handleCancelReceipt}
        closeModal={() => setIsCancelReceiptModalOpen(false)}
      />
    </>
  );
});
