import {Button, CurrencyInput} from '@/components';
import {Icon} from '@/components/Icon';
import {ReceiptImage} from '@/components/ReceiptImage';
import Touchable from '@/components/Touchable';
import {
  amountWithCurrency,
  applyStyles,
  numberWithCommas,
} from '@/helpers/utils';
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
import {
  cancelReceipt,
  getAllPayments,
  updateReceipt,
} from '@/services/ReceiptService';
import {ShareHookProps, useShare} from '@/services/share';
import {colors} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Text, ToastAndroid, View} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager, //@ts-ignore
} from 'react-native-bluetooth-escpos-printer';
import {BluetoothModal} from '../BluetoothModal';
import {ContactsListModal} from '../ContactsListModal';
import {CancelReceiptModal} from './CancelReceiptModal';
import {PreviewActionButton} from './PreviewActionButton';

export const ReceiptPreview = ({
  isNew,
  receipt,
}: {
  isNew: boolean;
  receipt?: IReceipt;
}) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const customers = getCustomers({realm});
  const user = getAuthService().getUser();
  const storageService = getStorageService();
  const analyticsService = getAnalyticsService();
  const currencyCode = getAuthService().getUserCurrencyCode();

  const [isLoading, setIsLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState('');
  const [printer, setPrinter] = useState<{address: string}>(
    {} as {address: string},
  );
  const [creditPaymentAmount, setCreditPaymentAmount] = useState(0);
  const [customer, setCustomer] = useState<ICustomer | undefined>(
    receipt?.customer,
  );
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [isCancelReceiptModalOpen, setIsCancelReceiptModalOpen] = useState(
    false,
  );

  const hasCustomer = customer?.name;
  const businessInfo = user?.businesses[0];
  const hasCustomerMobile = customer?.mobile;
  const allPayments = receipt ? getAllPayments({receipt}) : [];
  const creditDueDate =
    receipt?.credits && receipt?.credits[0] && receipt?.credits[0]?.due_date;
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
  }. Don't forget to make payment.\n\nPowered by Shara for free.\nhttp://shara.co`;

  const receiptShareMessage = `Hi${
    customer?.name ?? ''
  }, thank you for your recent purchase of ${
    receipt?.items?.length
  } item(s) from ${user?.businesses[0].name}.  You paid ${amountWithCurrency(
    totalAmountPaid,
  )} and owe ${amountWithCurrency(creditAmountLeft)} ${
    creditDueDate
      ? `(which is due on ${format(new Date(creditDueDate), 'MMM dd, yyyy')})`
      : ''
  }. Thank you.\n\nPowered by Shara for free.\nhttp://shara.co`;

  const shareProps: ShareHookProps = {
    image: receiptImage,
    recipient: receipt?.customer?.mobile,
    title: isFulfilled || isNew ? 'Share Receipt' : 'Payment Reminder',
    subject: isFulfilled || isNew ? 'Share Receipt' : 'Payment Reminder',
    message:
      isFulfilled || isNew ? receiptShareMessage : paymentReminderMessage,
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

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleSetCustomer = useCallback((value: ICustomer) => {
    setCustomer(value);
  }, []);

  const handleCreditPaymentAmountChange = useCallback((amount) => {
    setCreditPaymentAmount(amount);
  }, []);

  const handleCreditPaymentSubmit = useCallback(() => {
    if (customer?.name) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const newCustomer = customer._id
          ? customer
          : saveCustomer({realm, customer});
        receipt &&
          updateReceipt({
            realm,
            receipt,
            customer: newCustomer,
          });
        saveCreditPayment({
          realm,
          method: '',
          amount: creditPaymentAmount,
          customer: newCustomer,
        });
        setCreditPaymentAmount(0);
        ToastAndroid.show('Credit payment recorded', ToastAndroid.SHORT);
      }, 300);
    } else {
      Alert.alert('Info', 'Please select a customer');
    }
  }, [creditPaymentAmount, customer, realm, receipt]);

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
        await BluetoothEscposPrinter.printText(
          `${user?.businesses[0].name}\n`,
          receiptStyles.header,
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText(
          `${user?.businesses[0].address}\n`,
          {},
        );
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.CENTER,
        );
        await BluetoothEscposPrinter.printText(`Tel: ${user?.mobile}\n`, {});
        await BluetoothEscposPrinter.printerAlign(
          BluetoothEscposPrinter.ALIGN.LEFT,
        );
        await BluetoothEscposPrinter.printText(
          '--------------------------------\n',
          {},
        );
        await BluetoothEscposPrinter.printText(`${customerText}\n`, {});
        await BluetoothEscposPrinter.printText(
          `Date: ${format(new Date(), 'dd/MM/yyyy, hh:mm:a')}\n`,
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
      printer,
      customer,
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
    Alert.alert('Coming Soon', 'This feature is coming in the next PR');
  }, []);

  const handleCancelReceipt = useCallback(
    (note) => {
      setTimeout(() => {
        receipt && cancelReceipt({realm, receipt, cancellation_reason: note});
        setIsCancelReceiptModalOpen(false);
        navigation.goBack();
        ToastAndroid.show('Receipt cancelled', ToastAndroid.SHORT);
      }, 300);
    },
    [realm, receipt, navigation],
  );

  const handleEditReceipt = useCallback(() => {
    Alert.alert('Coming Soon', 'This feature is coming in the next sprint');
  }, []);

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

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <View style={applyStyles('mb-md')}>
        {!hasCustomer && (
          <Touchable onPress={handleOpenContactListModal}>
            <View
              style={applyStyles('center px-lg', {
                height: 40,
                borderRadius: 4,
                alignSelf: 'flex-start',
                backgroundColor: colors['red-50'],
              })}>
              <View style={applyStyles('flex-row items-center')}>
                <Icon
                  size={18}
                  name="plus"
                  type="feathericons"
                  color={colors['red-200']}
                />
                <Text
                  style={applyStyles('pl-sm text-400', {
                    color: colors['red-200'],
                  })}>
                  Add Customer
                </Text>
              </View>
            </View>
          </Touchable>
        )}
      </View>
      <View style={applyStyles('flex-row center')}>
        <View
          style={applyStyles('mb-lg', {
            elevation: 3,
            width: '100%',
            backgroundColor: colors.white,
          })}>
          <ReceiptImage
            user={user}
            tax={receipt?.tax}
            products={receipt?.items}
            customer={receipt?.customer}
            amountPaid={totalAmountPaid}
            creditDueDate={creditDueDate}
            creditAmount={creditAmountLeft}
            createdAt={receipt?.created_at}
            totalAmount={receipt?.total_amount}
            getImageUri={(data) => setReceiptImage(data)}
          />
        </View>
      </View>

      <View style={applyStyles('mb-lg flex-row justify-space-between')}>
        {receiptActions.map((item, index) => (
          <PreviewActionButton key={index.toString()} {...item} />
        ))}
      </View>

      {!isFulfilled && (
        <View style={applyStyles('mb-xl')}>
          <View style={applyStyles('mb-md')}>
            <CurrencyInput
              label="Amount Paid"
              value={creditPaymentAmount.toString()}
              onChange={(value) => handleCreditPaymentAmountChange(value)}
            />
          </View>
          <Button
            isLoading={isLoading}
            title="confirm payment"
            onPress={handleCreditPaymentSubmit}
          />
        </View>
      )}

      {hasCustomer && (
        <View
          style={applyStyles({
            paddingBottom: 100,
          })}>
          <View style={applyStyles('mb-md flex-row justify-space-between')}>
            <View
              style={applyStyles({
                height: 10,
                width: '33%',
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-50'],
              })}
            />
            <View>
              <Text
                style={applyStyles('text-400 text-uppercase', {
                  color: colors['gray-300'],
                })}>
                {isFulfilled || isNew ? 'Send via' : 'Send reminder'}
              </Text>
            </View>
            <View
              style={applyStyles({
                height: 10,
                width: '33%',
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-50'],
              })}
            />
          </View>
          <View
            style={applyStyles('flex-row items-center justify-space-between')}>
            {hasCustomerMobile && (
              <View style={applyStyles({width: '33%'})}>
                <Touchable onPress={onWhatsappShare}>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-center',
                      {
                        height: 48,
                      },
                    )}>
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
              <View style={applyStyles({width: '33%'})}>
                <Touchable onPress={onSmsShare}>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-center',
                      {
                        height: 48,
                      },
                    )}>
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
            <View style={applyStyles({width: '33%'})}>
              <Touchable onPress={onEmailShare}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                    {
                      height: 48,
                    },
                  )}>
                  <Icon
                    size={24}
                    name="mail"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors['gray-200'],
                    })}>
                    email
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
      )}
      <BluetoothModal
        visible={isPrintingModalOpen}
        onPrintReceipt={handlePrint}
        onClose={handleClosePrinterModal}
      />
      <ContactsListModal<ICustomer>
        entity="Customer"
        createdData={customers}
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onAddNew={() => navigation.navigate('AddCustomer')}
        onContactSelect={({givenName, familyName, phoneNumbers}) =>
          handleSetCustomer({
            name: `${givenName} ${familyName}`,
            mobile: phoneNumbers[0].number,
          })
        }
      />
      <CancelReceiptModal
        isVisible={isCancelReceiptModalOpen}
        onCancelReceipt={handleCancelReceipt}
        closeModal={() => setIsCancelReceiptModalOpen(false)}
      />
    </View>
  );
};
