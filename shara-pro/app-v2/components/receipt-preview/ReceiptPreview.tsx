import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Text, ToastAndroid, View, Image} from 'react-native';
import {
  Button,
  CurrencyInput,
  BluetoothModal,
  ContactsListModal,
  PreviewActionButton,
} from 'app-v2/components';
import {Icon} from 'app-v2/components/Icon';
import {ReceiptImage} from 'app-v2/components/ReceiptImage';
import Touchable from 'app-v2/components/Touchable';
import {ModalWrapperFields, withModal} from 'app-v2/helpers/hocs';
import {
  amountWithCurrency,
  applyStyles,
  numberWithCommas,
} from 'app-v2/helpers/utils';
import {ICustomer} from 'app-v2/models';
import {IReceipt} from 'app-v2/models/Receipt';
import {CreateReceipt} from 'app-v2/screens/main/receipt';
import {
  getAnalyticsService,
  getAuthService,
  getStorageService,
} from 'app-v2/services';
import {saveCreditPayment} from 'app-v2/services/CreditPaymentService';
import {getCustomers, saveCustomer} from 'app-v2/services/customer';
import {useAppNavigation} from 'app-v2/services/navigation';
import {useRealm} from 'app-v2/services/realm';
import {
  cancelReceipt,
  getAllPayments,
  updateReceipt,
} from 'app-v2/services/ReceiptService';
import {ShareHookProps, useShare} from 'app-v2/services/share';
import {colors} from 'app-v2/styles';
import {format} from 'date-fns';
import {
  BluetoothEscposPrinter,
  BluetoothManager, //@ts-ignore
} from 'react-native-bluetooth-escpos-printer';
import {CancelReceiptModal} from './CancelReceiptModal';
import {TitleDivider} from '../TitleDivider';

type Props = {
  isNew: boolean;
  onClose?(): void;
  receipt?: IReceipt;
} & ModalWrapperFields;

export const ReceiptPreview = withModal(
  ({isNew, receipt, onClose, openModal}: Props) => {
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
    const [isCancelReceiptModalOpen, setIsCancelReceiptModalOpen] = useState(
      false,
    );

    const hasCustomer = customer?.name;
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
        ? ` (which is due on ${format(
            new Date(creditDueDate),
            'MMM dd, yyyy',
          )})`
        : ''
    }. Thank you.\n\nPowered by Shara for free.\nwww.shara.co`;

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
            customer,
            method: '',
            amount: creditPaymentAmount,
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
            `Total: ${currencyCode} ${numberWithCommas(
              receipt?.total_amount,
            )}\n`,
            {},
          );
          await BluetoothEscposPrinter.printText(
            `Paid: ${currencyCode} ${numberWithCommas(totalAmountPaid)}\n`,
            {},
          );
          creditAmountLeft &&
            (await BluetoothEscposPrinter.printText(
              `Balance: ${currencyCode} ${numberWithCommas(
                creditAmountLeft,
              )}\n`,
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

    const handleReissueReceipt = useCallback(() => {
      const closeModal = openModal('full', {
        renderContent: () => (
          <CreateReceipt
            receipt={receipt}
            closeReceiptModal={() => {
              closeModal();
              onClose && onClose();
            }}
          />
        ),
      });
    }, [openModal, onClose, receipt]);

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
        {receipt && !receipt?.isPending && (
          <View>
            {!receipt?.is_cancelled && !hasCustomer && (
              <Touchable onPress={handleOpenContactList}>
                <View
                  style={applyStyles('center px-lg mx-xl mb-md', {
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
        )}
        <View style={applyStyles('flex-row center')}>
          {receipt?.isPending ? (
            <View
              style={applyStyles('mb-lg', {
                elevation: 3,
                width: '100%',
                backgroundColor: colors.white,
              })}>
              <Image
                style={applyStyles({height: 480})}
                source={{uri: receipt.local_image_url || receipt.image_url}}
              />
            </View>
          ) : (
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
          )}
        </View>

        {!receipt?.isPending && (
          <View>
            {!receipt?.is_cancelled && (
              <View
                style={applyStyles(
                  'mb-lg flex-row w-full justify-space-between flex-wrap',
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
          </View>
        )}

        {!(receipt?.isPending || receipt?.is_cancelled) && (
          <View style={applyStyles('px-xl')}>
            {!isFulfilled && !isNew && (
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
                  disabled={!creditPaymentAmount}
                  onPress={handleCreditPaymentSubmit}
                />
              </View>
            )}
          </View>
        )}

        {!receipt?.is_cancelled && hasCustomer && (
          <View
            style={applyStyles('px-xl', {
              paddingBottom: 24,
            })}>
            <TitleDivider
              title={isFulfilled || isNew ? 'Send via' : 'Send reminder'}
            />
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
                      name="mail"
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
                      more
                    </Text>
                  </View>
                </Touchable>
              </View>
            </View>
          </View>
        )}
        {!!receipt?.note && (
          <View
            style={applyStyles('px-xl', {
              paddingBottom: 24,
            })}>
            <TitleDivider title="Receipt Note" />
            <Text
              style={applyStyles('text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              {receipt?.note}
            </Text>
          </View>
        )}
        {!!receipt?.is_cancelled && (
          <View
            style={applyStyles('px-xl', {
              paddingBottom: 40,
            })}>
            <TitleDivider title="Cancellation Reason" />
            <Text
              style={applyStyles('text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              {receipt?.cancellation_reason}
            </Text>
          </View>
        )}
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
  },
);
