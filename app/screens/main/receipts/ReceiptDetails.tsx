import {
  BluetoothModal,
  Button,
  CancelReceiptModal,
  ContactsListModal,
  CurrencyInput,
  PreviewActionButton,
  ReceiptTableFooterItem,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
  StickyFooter,
} from '@/components/';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency, numberWithCommas, showToast} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {
  getAnalyticsService,
  getAuthService,
  getStorageService,
} from '@/services';
import {saveCreditPayment} from '@/services/CreditPaymentService';
import {getCustomers, saveCustomer} from '@/services/customer';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {useReceipt} from '@/services/receipt';
import {cancelReceipt, updateReceipt} from '@/services/ReceiptService';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
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
import {useReceiptProvider} from './ReceiptProvider';

type ReceiptDetailsProps = ModalWrapperFields & {
  receipt?: IReceipt;
  header?: ReactNode;
};

export const ReceiptDetails = withModal((props: ReceiptDetailsProps) => {
  let {receipt, openModal, header} = props;

  const realm = useRealm();
  const navigation = useAppNavigation();
  const {getReceiptAmounts} = useReceipt();
  const {handleClearReceipt, createReceiptFromCustomer} = useReceiptProvider();

  const customers = getCustomers({realm});
  const user = getAuthService().getUser();
  const storageService = getStorageService();
  const analyticsService = getAnalyticsService();
  const currencyCode = getAuthService().getUserCurrencyCode();
  const {creditAmountLeft, totalAmountPaid} = getReceiptAmounts(receipt);

  const [receiptImage, setReceiptImage] = useState('');
  const [printer, setPrinter] = useState<{address: string}>(
    {} as {address: string},
  );
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    receipt?.customer,
  );
  const [creditPaymentAmount, setCreditPaymentAmount] = useState(0);
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [isCancelReceiptModalOpen, setIsCancelReceiptModalOpen] = useState(
    false,
  );

  const creditDueDate = receipt?.dueDate;
  const receiptDate = receipt?.created_at ?? new Date();
  const businessInfo = getAuthService().getBusinessInfo();
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
      const productListColumnWidth = [21, 21];
      try {
        const savedPrinterAddress = printer ? printer.address : '';
        const printerAddressToUse = useSavedPrinter
          ? savedPrinterAddress
          : address;
        const customerText = `Receipt No: ${receipt?._id
          ?.toString()
          .substring(0, 6)}`;
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
        businessInfo.name &&
          (await BluetoothEscposPrinter.printText(
            `Tel: ${businessInfo.mobile || user?.mobile}\n`,
            {},
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
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printText(`${customerText}\n`, {});
        await BluetoothEscposPrinter.printText(
          `${format(receiptDate, 'dd/MM/yyyy')}\n`,
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        for (const item of receipt?.items ?? []) {
          const p = item.price;
          const q = item.quantity;
          const total = p * q;
          await BluetoothEscposPrinter.printColumn(
            productListColumnWidth,
            [
              BluetoothEscposPrinter.ALIGN.LEFT,
              BluetoothEscposPrinter.ALIGN.RIGHT,
            ],
            [
              `${q} x ${item.product.name}`,
              ` ${currencyCode}${numberWithCommas(total)}`,
            ],
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
          BluetoothEscposPrinter.ALIGN.CENTER,
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
          'CREATE RECEIPTS FOR FREE WITH SHARA\n www.shara.co\n',
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

  const handleReissueReceipt = useCallback(() => {
    navigation.navigate('CreateReceipt', {receipt});
  }, [receipt, navigation]);

  const handleClose = useCallback(() => {
    if (createReceiptFromCustomer) {
      handleClearReceipt();
      navigation.navigate('CustomerDetails', {
        customer: createReceiptFromCustomer,
      });
    } else {
      handleClearReceipt();
      navigation.navigate('Home');
    }
  }, [createReceiptFromCustomer, handleClearReceipt, navigation]);

  const handleCancelReceipt = useCallback(
    (note) => {
      setTimeout(() => {
        receipt && cancelReceipt({realm, receipt, cancellation_reason: note});
        setIsCancelReceiptModalOpen(false);
        handleClose();
        showToast({message: 'RECEIPT CANCELLED'});
      }, 50);
    },
    [receipt, realm, handleClose],
  );

  const handleEditReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
  }, []);

  const handleCreditPaymentAmountChange = useCallback((amount) => {
    setCreditPaymentAmount(amount);
  }, []);

  const handleCreditPaymentSubmit = useCallback(() => {
    if (customer?.name) {
      saveCreditPayment({
        realm,
        customer,
        receipt,
        method: '',
        amount: creditPaymentAmount,
      });
      setCreditPaymentAmount(0);
      showToast({message: 'CREDIT PAYMENT RECORDED'});
    } else {
      Alert.alert('Info', 'Please select a customer');
    }
  }, [creditPaymentAmount, customer, receipt, realm]);

  const handleOpenContactList = useCallback(() => {
    const closeContactListModal = openModal('bottom-half', {
      swipeDirection: [],
      renderContent: () => (
        <ContactsListModal<ICustomer>
          entity="Customer"
          onAddNew={undefined}
          onClose={closeContactListModal}
          createdData={(customers as unknown) as ICustomer[]}
          onContactSelect={(data) =>
            handleSetCustomer(data, closeContactListModal)
          }
        />
      ),
    });
  }, [customers, handleSetCustomer, openModal]);

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

  header = header ?? (
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
      <HeaderBackButton {...{iconName: 'arrow-left', onPress: handleClose}} />
      <ReceiptListItem
        isHeader
        style={applyStyles({
          left: -14,
          borderBottomWidth: 0,
          width: Dimensions.get('window').width - 34,
        })}
        receipt={receipt}
        onPress={receipt?.hasCustomer ? undefined : handleOpenContactList}
      />
    </View>
  );

  return (
    <>
      {header}
      <View style={applyStyles('bg-white flex-1 pt-4')}>
        <FlatList
          data={[]}
          persistentScrollbar
          renderItem={undefined}
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={
            <>
              {!isFulfilled && !receipt?.is_cancelled && (
                <View style={applyStyles('p-16')}>
                  <Text
                    style={applyStyles(
                      'text-xs text-uppercase text-500 text-gray-100 pb-8',
                    )}>
                    how much has been paid?
                  </Text>
                  <View
                    style={applyStyles(
                      'pb-8 flex-row items-center justify-between',
                    )}>
                    <View style={applyStyles({width: '48%'})}>
                      <CurrencyInput
                        value={creditPaymentAmount.toString()}
                        onChange={(value) =>
                          handleCreditPaymentAmountChange(value)
                        }
                      />
                    </View>
                    <View style={applyStyles({width: '48%'})}>
                      <Button
                        title="record payment"
                        disabled={!creditPaymentAmount}
                        onPress={handleCreditPaymentSubmit}
                      />
                    </View>
                  </View>
                </View>
              )}
              <FlatList
                persistentScrollbar
                data={receipt?.items}
                renderItem={renderItem}
                keyboardShouldPersistTaps="always"
                ListHeaderComponent={
                  <ReceiptTableHeader
                    style={applyStyles({
                      borderTopWidth: 1,
                      borderTopColor: colors['gray-10'],
                    })}
                  />
                }
                keyExtractor={(item, index) =>
                  `${item?._id?.toString()}-${index}`
                }
                ListFooterComponent={
                  <>
                    {!receipt?.is_cancelled && (
                      <View
                        style={applyStyles('px-16 items-end', {
                          borderTopWidth: 1,
                          borderTopColor: colors['gray-10'],
                        })}>
                        <ReceiptTableFooterItem
                          title="Total"
                          value={amountWithCurrency(receipt?.total_amount)}
                        />
                        <ReceiptTableFooterItem
                          title="Paid"
                          value={amountWithCurrency(totalAmountPaid)}
                        />
                        {!isFulfilled && (
                          <ReceiptTableFooterItem
                            title="Owes"
                            valueTextStyle={applyStyles('text-red-200')}
                            value={amountWithCurrency(creditAmountLeft)}
                          />
                        )}
                      </View>
                    )}
                  </>
                }
              />
            </>
          }
        />
        <>
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
          {!receipt?.is_cancelled && (
            <StickyFooter style={applyStyles('py-16 px-24 bg-white')}>
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
            </StickyFooter>
          )}
        </>
      </View>

      <View style={applyStyles({opacity: 0, height: 0})}>
        <ReceiptImage
          user={user}
          tax={receipt?.tax}
          captureMode="update"
          products={receipt?.items}
          amountPaid={totalAmountPaid}
          creditDueDate={creditDueDate}
          creditAmount={creditAmountLeft}
          createdAt={receipt?.created_at}
          totalAmount={receipt?.total_amount}
          isCancelled={receipt?.is_cancelled}
          customer={customer || receipt?.customer}
          getImageUri={(data) => setReceiptImage(data)}
          receiptNo={receipt?._id?.toString().substring(0, 6)}
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
