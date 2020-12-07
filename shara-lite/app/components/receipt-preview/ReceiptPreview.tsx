import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {BluetoothModal, PreviewActionButton} from '@/components';
import {Icon} from '@/components/Icon';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, numberWithCommas} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {
  getAnalyticsService,
  getAuthService,
  getStorageService,
} from '@/services';
import {getCustomers, saveCustomer} from '@/services/customer';
import {useRealm} from '@/services/realm';
import {
  cancelReceipt,
  getAllPayments,
  updateReceipt,
} from '@/services/ReceiptService';
import {ShareHookProps, useShare} from '@/services/share';
import {colors} from '@/styles';
import {format} from 'date-fns';
import {
  BluetoothEscposPrinter,
  BluetoothManager, //@ts-ignore
} from 'react-native-bluetooth-escpos-printer';
import {CancelReceiptModal} from './CancelReceiptModal';
import {applyStyles} from '@/styles';
import {StickyFooter} from '../StickyFooter';
import {Button} from '../Button';
import {AddCustomerModal} from '../AddCustomerModal';
import {ScrollView} from 'react-native-gesture-handler';

type Props = {
  receipt?: IReceipt;
  onClose?: () => void;
};

export const ReceiptPreview = ({receipt, onClose}: Props) => {
  const realm = useRealm();
  const customers = getCustomers({realm});
  const user = getAuthService().getUser();
  const storageService = getStorageService();
  const analyticsService = getAnalyticsService();
  const currencyCode = getAuthService().getUserCurrencyCode();

  const [receiptImage, setReceiptImage] = useState('');
  const [printer, setPrinter] = useState<{address: string}>(
    {} as {address: string},
  );
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    receipt?.customer,
  );
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isCancelReceiptModalOpen, setIsCancelReceiptModalOpen] = useState(
    false,
  );

  const creditDueDate = receipt?.dueDate;
  const receiptDate = receipt?.created_at ?? new Date();
  const businessInfo = getAuthService().getBusinessInfo();
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
        const newCustomer =
          value && saveCustomer({realm, customer: value, source: 'manual'});
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

  const handleOpenPrinterModal = useCallback(() => {
    setIsPrintingModalOpen(true);
  }, []);

  const handleClosePrinterModal = useCallback(() => {
    setIsPrintingModalOpen(false);
  }, []);

  const handleOpenAddCustomerModal = useCallback(() => {
    setIsAddCustomerModalOpen(true);
  }, []);

  const handleCloseAddCustomerModal = useCallback(() => {
    setIsAddCustomerModalOpen(false);
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

  const handleCancelReceipt = useCallback(
    (note) => {
      setTimeout(() => {
        receipt && cancelReceipt({realm, receipt, cancellation_reason: note});
        setIsCancelReceiptModalOpen(false);
        onClose && onClose();
        ToastAndroid.show('Receipt cancelled', ToastAndroid.SHORT);
      }, 300);
    },
    [realm, receipt, onClose],
  );

  const handleEditReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update');
  }, []);

  const receiptActions = [
    {
      label: 'Cancel',
      icon: 'x-circle',
      onPress: () => setIsCancelReceiptModalOpen(true),
    },
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

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      <Text style={applyStyles('py-24 text-700 text-red-200 text-center')}>
        Your receipt was created succesfully
      </Text>
      {!receiptImage ? (
        <View style={applyStyles('flex-1 center bg-white')}>
          <ActivityIndicator color={colors.primary} size={40} />
          <Text style={applyStyles('text-400 text-gray-200 py-8')}>
            Generating receipt image. This might take a while
          </Text>
        </View>
      ) : (
        <ScrollView
          persistentScrollbar
          contentContainerStyle={applyStyles('center')}
          style={applyStyles('mb-16 mx-48', {
            elevation: 3,
            transform: [{scale: 1}],
            backgroundColor: colors.white,
          })}>
          <Image
            resizeMode="contain"
            style={applyStyles({
              width: 350,
              height: 400,
            })}
            source={{uri: `data:image/png;base64,${receiptImage}`}}
          />
        </ScrollView>
      )}
      {!receipt?.is_cancelled && (
        <View
          style={applyStyles(
            'mb-16 flex-row center w-full justify-space-between flex-wrap',
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
      {receipt?.customer?.name ? (
        <View style={applyStyles('px-16')}>
          <Text
            style={applyStyles(
              'pb-8 px-32 text-700 text-gray-200 text-center text-uppercase',
            )}>
            Customer
          </Text>
          <Touchable onPress={handleOpenAddCustomerModal}>
            <View style={applyStyles('py-16 px-8 center w-full')}>
              <Text
                style={applyStyles(
                  'text-700 text-red-200 text-uppercase text-base text-center',
                  {
                    textDecorationLine: 'underline',
                  },
                )}>
                {receipt?.customer?.name}
              </Text>
            </View>
          </Touchable>
        </View>
      ) : (
        <View style={applyStyles('px-16')}>
          <Text
            style={applyStyles(
              'pb-16 px-48 text-700 text-gray-200 text-center text-uppercase',
            )}>
            Share this receipt with your customer
          </Text>
          <Button title="Add Customer" onPress={handleOpenAddCustomerModal} />
        </View>
      )}

      {!receipt?.is_cancelled && (
        <StickyFooter style={applyStyles('py-16 px-24 bg-white')}>
          <Text
            style={applyStyles(
              'text-center text-700 text-gray-200 text-uppercase',
            )}>
            Share receipt
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
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors['gray-200'],
                    })}>
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
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors['gray-200'],
                    })}>
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
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors['gray-200'],
                    })}>
                    others
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </StickyFooter>
      )}

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

      <AddCustomerModal
        customer={customer}
        visible={isAddCustomerModalOpen}
        onAddCustomer={handleSetCustomer}
        onClose={handleCloseAddCustomerModal}
      />
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
    </View>
  );
};
