import {format} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {
  BluetoothEscposPrinter,
  BluetoothManager, //@ts-ignore
} from 'react-native-bluetooth-escpos-printer';
import {Customer} from '../../../../../types/app';
import {
  BluetoothModal,
  Button,
  ContactsListModal,
  PageModal,
} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {PAYMENT_METHOD_LABEL} from '../../../../helpers/constants';
import {
  amountWithCurrency,
  applyStyles,
  numberWithCommas,
} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {IReceipt} from '../../../../models/Receipt';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {getAuthService, getStorageService} from '../../../../services';
import {getCustomers, saveCustomer} from '../../../../services/CustomerService';
import {useRealm} from '../../../../services/realm';
import {
  getAllPayments,
  updateReceipt,
} from '../../../../services/ReceiptService';
import {colors} from '../../../../styles';
import AddCustomer from '../../customers/AddCustomer';
import {
  SummaryTableHeader,
  summaryTableItemStyles,
  summaryTableStyles,
} from './ReceiptSummary';

type Props = {
  visible: boolean;
  onClose: () => void;
  receipt: IReceipt | null;
  onOpenShareModal: () => void;
};

type ProductItemProps = {
  item: IReceiptItem;
};

export function ReceiptDetailsModal(props: Props) {
  const {receipt, visible, onClose, onOpenShareModal} = props;

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | ICustomer | undefined>(
    receipt ? receipt.customer : ({} as Customer),
  );
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [printer, setPrinter] = useState<{address: string}>(
    {} as {address: string},
  );

  const realm = useRealm();
  const authService = getAuthService();
  const user = authService.getUser();
  const storageService = getStorageService();
  const currencyCode = authService.getUserCurrencyCode();
  const creditAmountLeft = receipt?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );
  const customers = getCustomers({realm});
  const allPayments = receipt ? getAllPayments({receipt}) : [];
  const totalAmountPaid = allPayments.reduce(
    (total, payment) => total + payment.amount_paid,
    0,
  );
  const creditDueDate = receipt?.credits?.length && receipt.credits[0].due_date;

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

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleOpenAddCustomerModal = useCallback(() => {
    setIsAddCustomerModalOpen(true);
  }, []);

  const handleCloseAddCustomerModal = useCallback(() => {
    setIsAddCustomerModalOpen(false);
  }, []);

  const handleSaveCustomer = useCallback(
    (value: ICustomer) => {
      setCustomer(value);
      const newCustomer = value._id
        ? value
        : saveCustomer({realm, customer: value});

      receipt && updateReceipt({realm, customer: newCustomer, receipt});
      ToastAndroid.show('Receipt edited with customer', ToastAndroid.SHORT);
    },
    [realm, receipt],
  );

  const handleAddNewCustomer = useCallback(
    (newCustomer) => {
      handleSaveCustomer(newCustomer);
      handleCloseAddCustomerModal();
    },
    [handleSaveCustomer, handleCloseAddCustomerModal],
  );

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
          ['Description', 'QTY', `SubTotal(${currencyCode})`],
          receiptStyles.product,
        );
        if (receipt && receipt.items) {
          for (const item of receipt.items) {
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
      handleClosePrinterModal,
      handleOpenPrinterModal,
      printer,
      receipt,
      user,
      totalAmountPaid,
      creditAmountLeft,
    ],
  );

  const handlePrintClick = useCallback(() => {
    if (printer) {
      handlePrintReceipt(undefined, true);
    } else {
      handleOpenPrinterModal();
    }
  }, [handleOpenPrinterModal, handlePrintReceipt, printer]);

  const renderProductItem = useCallback(
    ({item}: ProductItemProps) => (
      <View
        style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
        <View style={summaryTableStyles['column-40']}>
          <Text style={summaryTableItemStyles.text}>
            {item.name} {item.weight ? `(${item.weight})` : ''}
          </Text>
          <Text style={summaryTableItemStyles.subText}>
            {amountWithCurrency(item.price)} Per Unit
          </Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-20'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>{item.quantity}</Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-40'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>
            {amountWithCurrency(item.price * item.quantity)}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onDismiss={onClose}
      onRequestClose={onClose}>
      <ScrollView style={applyStyles('px-lg py-xl')} persistentScrollbar={true}>
        <View
          style={applyStyles(
            'pb-md mb-lg w-full flex-row justify-space-between',
            {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <View style={applyStyles({width: '48%'})}>
            <Text
              style={applyStyles('pb-sm', 'text-400', {
                color: colors['gray-200'],
              })}>
              Receipt for
            </Text>
            <View>
              {receipt?.customer?.name ? (
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 18,
                    color: colors['gray-300'],
                  })}>
                  {receipt.customer.name}
                </Text>
              ) : (
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 12,
                    color: colors['gray-50'],
                  })}>
                  - No customer details
                </Text>
              )}
            </View>
          </View>
          <View style={applyStyles({width: '48%', alignItems: 'flex-end'})}>
            <Text
              style={applyStyles('pb-xs', 'text-400', {
                color: colors['gray-200'],
              })}>
              Total
            </Text>
            <Text
              style={applyStyles('text-400', {
                fontSize: 18,
                color: colors.primary,
              })}>
              {amountWithCurrency(receipt?.total_amount)}
            </Text>
          </View>
        </View>
        {!receipt?.customer?.name && (
          <View>
            <Touchable onPress={handleOpenContactListModal}>
              <View
                style={applyStyles(
                  'py-lg mb-xl flex-row items-center justify-center',
                )}>
                <Icon
                  size={24}
                  name="plus"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                    color: colors.primary,
                  })}>
                  Add customer
                </Text>
              </View>
            </Touchable>
          </View>
        )}
        <View>
          <Text
            style={applyStyles('pb-sm', 'text-400', {
              fontSize: 18,
              color: colors.primary,
            })}>
            Products
          </Text>
          {receipt && (
            <>
              <FlatList
                data={receipt.items}
                renderItem={renderProductItem}
                ListHeaderComponent={SummaryTableHeader}
                keyExtractor={(item, index) =>
                  item ? `${item._id}-${index.toString()}` : index.toString()
                }
              />
              <View style={styles.totalSectionContainer}>
                <View style={styles.totalSection}>
                  <View
                    style={applyStyles(
                      'pb-sm',
                      'flex-row',
                      'items-center',
                      'justify-space-between',
                    )}>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      Tax:
                    </Text>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      {receipt?.tax}
                    </Text>
                  </View>
                  <View
                    style={applyStyles(
                      'flex-row',
                      'items-center',
                      'justify-space-between',
                    )}>
                    <Text
                      style={applyStyles(
                        {
                          color: colors['gray-300'],
                        },
                        'text-400',
                      )}>
                      Total:
                    </Text>
                    <Text style={styles.totalAmountText}>
                      {amountWithCurrency(receipt?.total_amount)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
        <Button
          variantColor="white"
          onPress={handlePrintClick}
          style={applyStyles({marginVertical: 32})}>
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
        {!!(receipt?.payments?.length || receipt?.credit_amount) && (
          <View style={applyStyles({paddingBottom: 100})}>
            <Text
              style={applyStyles('pb-lg', 'text-400', {
                fontSize: 18,
                color: colors.primary,
              })}>
              Payments
            </Text>
            <View
              style={applyStyles(
                'flex-row',
                'w-full',
                'justify-space-between',
              )}>
              <View style={applyStyles({width: '48%'})}>
                {allPayments.length ? (
                  allPayments?.map((item) => (
                    <View style={applyStyles('pb-lg')}>
                      <Text
                        style={applyStyles('pb-xs', 'text-400', {
                          color: colors['gray-200'],
                        })}>
                        Paid By {PAYMENT_METHOD_LABEL[item.method]}
                      </Text>
                      <Text
                        style={applyStyles('text-400', {
                          fontSize: 16,
                          color: colors['gray-300'],
                        })}>
                        {amountWithCurrency(item.amount_paid)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text
                    style={applyStyles('text-400', {
                      color: colors['gray-50'],
                    })}>
                    - No payments
                  </Text>
                )}
              </View>
              {!!creditAmountLeft && (
                <View style={applyStyles({width: '48%'})}>
                  <View>
                    <Text
                      style={applyStyles('pb-xs', 'text-400', {
                        color: colors['gray-200'],
                      })}>
                      You are owed
                    </Text>
                    <Text
                      style={applyStyles('text-400', {
                        fontSize: 16,
                        color: colors.primary,
                      })}>
                      {amountWithCurrency(creditAmountLeft)}
                    </Text>
                  </View>
                  {creditDueDate && (
                    <Text
                      style={applyStyles('pb-xs', 'text-400', {
                        fontSize: 12,
                        color: colors['gray-100'],
                      })}>
                      Due on {format(new Date(creditDueDate), 'MMM dd, yyyy')}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
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
          title="Done"
          variantColor="red"
          onPress={onClose}
          style={styles.actionButton}
        />
      </View>

      <ContactsListModal<ICustomer>
        entity="Customer"
        createdData={customers}
        visible={isContactListModalOpen}
        onAddNew={handleOpenAddCustomerModal}
        onClose={handleCloseContactListModal}
        onContactSelect={({givenName, familyName, phoneNumbers}) =>
          handleSaveCustomer({
            name: `${givenName} ${familyName}`,
            mobile: phoneNumbers[0].number,
          })
        }
      />

      <BluetoothModal
        visible={isPrintingModalOpen}
        onClose={handleClosePrinterModal}
        onPrintReceipt={handlePrintReceipt}
      />

      <PageModal
        title="Add Customer"
        visible={isAddCustomerModalOpen}
        onClose={handleCloseAddCustomerModal}>
        <AddCustomer onSubmit={handleAddNewCustomer} />
      </PageModal>
    </Modal>
  );
}

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
  totalSectionContainer: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  totalSection: {
    width: '60%',
  },
  totalAmountText: {
    fontSize: 18,
    color: colors['gray-300'],
    fontFamily: 'Rubik-Medium',
  },
});
