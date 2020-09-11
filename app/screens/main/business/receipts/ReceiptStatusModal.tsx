import format from 'date-fns/format';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Image,
  ImageProps,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  ToastAndroid,
  View,
  ViewStyle,
} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager, //@ts-ignore
} from 'react-native-bluetooth-escpos-printer';
import {BluetoothModal, Button} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {
  amountWithCurrency,
  applyStyles,
  numberWithCommas,
} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {getAuthService, getStorageService} from '../../../../services';
import {colors} from '../../../../styles';

type Props = {
  visible: boolean;
  timeTaken: number;
  isSaving: boolean;
  amountPaid: number;
  customer: ICustomer;
  totalAmount: number;
  creditAmount: number;
  isCompleting: boolean;
  onComplete: () => void;
  products: IReceiptItem[];
  onOpenShareModal: () => void;
  onNewReceiptClick: () => void;
  onOpenCustomerModal: () => void;
};

type StatusProps = {
  [key: string]: PageProps;
};

type PageProps = {
  heading: string;
  buttonText: string;
  closeButtonColor: string;
  icon: ImageProps['source'];
  buttonVariant: 'red' | 'white';
  style: {container: ViewStyle; text: TextStyle; heading: TextStyle};
};

export const ReceiptStatusModal = (props: Props) => {
  const {
    visible,
    isSaving,
    products,
    timeTaken,
    amountPaid,
    onComplete,
    totalAmount,
    isCompleting,
    creditAmount,
    onOpenShareModal,
    onNewReceiptClick,
    onOpenCustomerModal,
    customer: customerProps,
  } = props;

  const [customer, setCustomer] = useState(customerProps);
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [printer, setPrinter] = useState<{address: string}>(
    {} as {address: string},
  );

  const authService = getAuthService();
  const storageService = getStorageService();
  const user = authService.getUser();
  const currencyCode = authService.getUserCurrencyCode();

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
    setCustomer(customerProps);
  }, [customerProps]);

  const statusProps: StatusProps = {
    success: {
      heading: 'Success!',
      buttonText: 'Done',
      closeButtonColor: colors.primary,
      icon: require('../../../../assets/icons/check-circle.png'),
      buttonVariant: 'red',
      style: {
        text: {color: colors['gray-200']},
        heading: {color: colors['gray-300']},
        container: {backgroundColor: colors.white},
      },
    },
    error: {
      heading: 'Error!',
      buttonText: 'Retry',
      closeButtonColor: colors.white,
      icon: require('../../../../assets/icons/x-circle.png'),
      buttonVariant: 'white',
      style: {
        text: {color: colors.white},
        heading: {color: colors.white},
        container: {backgroundColor: colors.primary},
      },
    },
  };

  const handleOpenPrinterModal = useCallback(() => {
    setIsPrintingModalOpen(true);
  }, []);

  const handleClosePrinterModal = useCallback(() => {
    setIsPrintingModalOpen(false);
  }, []);

  const handlePrintReceipt = useCallback(
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
          ['Description', 'QTY', 'SubTotal(NGN)'],
          receiptStyles.product,
        );
        for (const item of products) {
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
          `Total: ${currencyCode} ${numberWithCommas(totalAmount)}\n`,
          {},
        );
        await BluetoothEscposPrinter.printText(
          `Paid: ${currencyCode} ${numberWithCommas(amountPaid)}\n`,
          {},
        );
        creditAmount &&
          (await BluetoothEscposPrinter.printText(
            `Balance: ${currencyCode} ${numberWithCommas(creditAmount)}\n`,
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
          'Powered by Shara. www.shara.co\n',
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
        handleClosePrinterModal();
      } catch (err) {
        ToastAndroid.show(err.toString(), ToastAndroid.SHORT);
        handleOpenPrinterModal();
      }
    },
    [
      currencyCode,
      customer,
      printer,
      products,
      totalAmount,
      amountPaid,
      creditAmount,
      user,
      handleOpenPrinterModal,
      handleClosePrinterModal,
    ],
  );

  const handlePrintClick = useCallback(() => {
    if (printer) {
      handlePrintReceipt(undefined, true);
    } else {
      handleOpenPrinterModal();
    }
  }, [handleOpenPrinterModal, handlePrintReceipt, printer]);

  return (
    <Modal transparent={false} animationType="slide" visible={visible}>
      <ScrollView persistentScrollbar={true}>
        <View style={styles.statusModalContent}>
          <Image
            source={statusProps.success.icon}
            style={applyStyles('mb-xl', styles.statusModalIcon)}
          />
          <Text
            style={applyStyles(
              'pb-sm',
              styles.statusModalHeadingText,
              statusProps.success.style.heading,
              'heading-700',
            )}>
            {statusProps.success.heading}
          </Text>
          <Text
            style={applyStyles(
              styles.statusModalDescription,
              statusProps.success.style.text,
              'text-400',
            )}>
            You have successfully issued a receipt for{' '}
            <Text style={applyStyles('text-700')}>
              {amountWithCurrency(amountPaid)}
            </Text>{' '}
            in Cash and{' '}
            <Text style={applyStyles('text-700', {color: colors.primary})}>
              {amountWithCurrency(creditAmount)}
            </Text>{' '}
            in Credit
          </Text>
          <Text
            style={applyStyles(
              styles.statusModalDescription,
              statusProps.success.style.text,
              'text-400',
            )}>
            Time taken: {format(timeTaken, 'mm:ss')}
          </Text>
        </View>

        <View style={applyStyles({marginBottom: 40, paddingHorizontal: 16})}>
          {customer.name ? (
            <>
              <Text
                style={applyStyles(
                  'pb-md',
                  'text-400',
                  'text-uppercase',
                  'text-center',
                  {
                    color: colors.primary,
                  },
                )}>
                Customer details
              </Text>
              <Text
                style={applyStyles(
                  'pb-sm',
                  'text-400',
                  'text-center',
                  'text-uppercase',
                  {
                    fontSize: 18,
                    color: colors['gray-300'],
                  },
                )}>
                {customer.name}
              </Text>
              {customer.mobile && (
                <Text
                  style={applyStyles('pb-md', 'text-400', 'text-center', {
                    color: colors['gray-300'],
                  })}>
                  {customer.mobile}
                </Text>
              )}
              <Touchable onPress={onOpenCustomerModal}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                    {
                      paddingVertical: 16,
                    },
                  )}>
                  <Icon
                    size={24}
                    name="edit"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text style={styles.addProductButtonText}>
                    Change customer
                  </Text>
                </View>
              </Touchable>
            </>
          ) : (
            <>
              <View
                style={applyStyles('items-center, justify-center', {
                  marginBottom: 16,
                })}>
                <Text
                  style={applyStyles('text-400', 'text-center', {
                    color: colors['gray-100'],
                  })}>
                  Do you want to add the customers' details?
                </Text>
              </View>
              <Touchable onPress={onOpenCustomerModal}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                    {
                      paddingVertical: 16,
                    },
                  )}>
                  <Icon
                    size={24}
                    name="plus"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text style={styles.addProductButtonText}>
                    Add customer details
                  </Text>
                </View>
              </Touchable>
            </>
          )}
          <Button
            variantColor="white"
            onPress={handlePrintClick}
            style={applyStyles({marginTop: 24})}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={24}
                name="printer"
                type="feathericons"
                color={colors['gray-50']}
              />
              <Text
                style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                  color: colors['gray-200'],
                })}>
                Print receipt
              </Text>
            </View>
          </Button>
          <Button
            variantColor="red"
            isLoading={isSaving}
            title="Create new receipt"
            onPress={onNewReceiptClick}
            style={applyStyles({marginTop: 24})}
          />
        </View>
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          variantColor="clear"
          style={styles.actionButton}
          onPress={onOpenShareModal}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
            <Icon
              size={24}
              name="share"
              type="feathericons"
              color={colors['gray-50']}
            />
            <Text
              style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                color: colors['gray-200'],
              })}>
              Share
            </Text>
          </View>
        </Button>
        <Button
          title="Finish"
          variantColor="red"
          onPress={onComplete}
          isLoading={isCompleting}
          style={styles.actionButton}
        />
      </View>
      <BluetoothModal
        visible={isPrintingModalOpen}
        onClose={handleClosePrinterModal}
        onPrintReceipt={handlePrintReceipt}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  addProductButtonText: {
    paddingLeft: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Rubik-Regular',
  },
  actionButtons: {
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  actionButton: {
    width: '48%',
  },
  statusModalContent: {
    flex: 1,
    marginTop: 32,
    marginBottom: 16,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    justifyContent: 'center',
    borderBottomColor: colors['gray-20'],
  },
  statusModalIcon: {
    width: 64,
    height: 64,
  },
  statusModalHeadingText: {
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statusModalDescription: {
    fontSize: 16,
    maxWidth: 260,
    lineHeight: 27,
    textAlign: 'center',
    marginHorizontal: 'auto',
  },
});
