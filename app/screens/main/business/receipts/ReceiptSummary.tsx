import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Share from 'react-native-share';
import {
  Button,
  CurrencyInput,
  FloatingLabelInput,
} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {useRealm} from '../../../../services/realm';
import {saveReceipt} from '../../../../services/ReceiptService';
import {colors} from '../../../../styles';
import {CustomerDetailsModal} from './CustomerDetailsModal';
import {EditProductModal} from './EditProductModal';
import {PaymentMethodModal} from './PaymentMethodModal';
import {Receipts} from './Receipts';
import {ReceiptStatusModal} from './ReceiptStatusModal';
import {ShareReceiptModal} from './ShareReceiptModal';
import HeaderRight from '../../../../components/HeaderRight';
import {IReceiptItem} from '../../../../models/ReceiptItem';

export type SummaryTableItemProps = {
  item: IReceiptItem;
};

type Props = {
  products: IReceiptItem[];
  onClearReceipt: () => void;
  onCloseSummaryModal: () => void;
  onRemoveProductItem: (item: IReceiptItem) => void;
  onUpdateProductItem: (item: IReceiptItem) => void;
};

export const summaryTableStyles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingBottom: 12,
    flexDirection: 'row',
  },
  'column-20': {
    width: '20%',
  },
  'column-40': {
    width: '40%',
  },
});

export const summaryTableHeaderStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-900'],
  },
  text: {
    fontFamily: 'Rubik-Medium',
    color: colors['gray-300'],
  },
});

export const summaryTableItemStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  text: {
    fontSize: 16,
    paddingBottom: 4,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-300'],
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-200'],
  },
});

export const SummaryTableHeader = () => {
  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableHeaderStyles.row)}>
      <View style={summaryTableStyles['column-40']}>
        <Text style={summaryTableHeaderStyles.text}>Description</Text>
      </View>
      <View
        style={applyStyles(summaryTableStyles['column-20'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableHeaderStyles.text}>QTY</Text>
      </View>
      <View
        style={applyStyles(summaryTableStyles['column-40'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableHeaderStyles.text}>Subtotal</Text>
      </View>
    </View>
  );
};

export const SummaryTableItem = ({
  item,
  onPress,
}: SummaryTableItemProps & {onPress?: (item: IReceiptItem) => void}) => {
  const price = item.price ? item.price : 0;
  const quantity = item.quantity ? item.quantity : 0;
  const subtotal = price * quantity;

  return (
    <Touchable onPress={onPress ? () => onPress(item) : () => {}}>
      <View
        style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
        <View style={summaryTableStyles['column-40']}>
          <Text style={summaryTableItemStyles.text}>
            {item.product.name} {item.product.weight ? `(${item.weight})` : ''}
          </Text>
          <Text style={summaryTableItemStyles.subText}>
            &#8358;{numberWithCommas(price)} Per Unit
          </Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-20'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>{quantity}</Text>
        </View>
        <View
          style={applyStyles(summaryTableStyles['column-40'], {
            alignItems: 'flex-end',
          })}>
          <Text style={summaryTableItemStyles.text}>
            &#8358;{numberWithCommas(subtotal)}
          </Text>
        </View>
        <View
          style={applyStyles('flex-row', 'w-full', {
            justifyContent: 'flex-end',
          })}>
          <View
            style={applyStyles('flex-row', 'items-center', 'justify-center')}>
            <Icon
              size={14}
              name="edit"
              type="feathericons"
              color={colors.primary}
            />
            <Text
              style={applyStyles('text-400', 'text-uppercase', 'pl-xs', {
                fontSize: 12,
                color: colors.primary,
              })}>
              Tap to edit
            </Text>
          </View>
        </View>
      </View>
    </Touchable>
  );
};

const ReceiptSummary = (props: Props) => {
  const navigation = useNavigation();
  const realm = useRealm();

  const {
    products,
    onClearReceipt,
    onRemoveProductItem,
    onUpdateProductItem,
    onCloseSummaryModal,
  } = props;
  const tax = 0;

  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [paymentType, setPaymentType] = useState<
    'cash' | 'transfer' | 'mobile'
  >('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customer, setCustomer] = useState<Customer | ICustomer>(
    {} as Customer,
  );
  const [selectedProduct, setSelectedProduct] = useState<IReceiptItem | null>(
    null,
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const creditAmount = payments.length ? totalAmount - amountPaid : totalAmount;

  //@ts-ignore
  const timeTaken = new Date().getTime() - global.startTime;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const handleCancel = useCallback(() => {
    onCloseSummaryModal();
  }, [onCloseSummaryModal]);

  const handleAddProduct = useCallback(() => {
    onCloseSummaryModal();
  }, [onCloseSummaryModal]);

  const handleOpenSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(true);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const handleOpenShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const handleCloseShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const handleOpenCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(true);
  }, []);

  const handleCloseCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(false);
  }, []);

  const handleOpenEditProductModal = useCallback((item: IReceiptItem) => {
    setSelectedProduct(item);
  }, []);

  const handleCloseEditProductModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleOpenPaymentModal = useCallback(
    (type: 'cash' | 'transfer' | 'mobile') => {
      setPaymentType(type);
      setIsPaymentModalOpen(true);
    },
    [],
  );

  const handleClosePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
  }, []);

  const handleOpenContactList = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactList = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleSmsShare = useCallback(async () => {
    // TODO: use better copy for shara invite
    const shareOptions = {
      url: 'https://shara.co/',
      //@ts-ignore
      social: Share.Social.SMS,
      message: 'Here is your receipt',
      recipient: `${customer.mobile}`,
      title: `Share receipt with ${customer.name}`,
    };

    if (!customer.mobile) {
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    }
  }, [customer.mobile, customer.name]);

  const handleEmailShare = useCallback(
    async (email: string, callback: () => void) => {
      // TODO: use better copy for shara invite
      const shareOptions = {
        email,
        title: 'Share receipt',
        url: 'https://shara.co/',
        message: 'Here is your receipt',
        subject: customer.name ? `${customer.name}'s Receipt` : 'Your Receipt',
      };

      try {
        await Share.open(shareOptions);
        callback();
      } catch (e) {
        Alert.alert('Error', e.error);
      }
    },
    [customer.name],
  );

  const handleWhatsappShare = useCallback(async () => {
    // TODO: use better copy for shara invite
    const shareOptions = {
      url: 'https://shara.co/',
      social: Share.Social.WHATSAPP,
      message: 'Here is your receipt',
      title: `Share receipt with ${customer.name}`,
      whatsAppNumber: `+234${customer.mobile}`, // country code + phone number
      // filename:  `data:image/png;base64,<base64_data>`,
    };
    const errorMessages = {
      filename: 'Invalid file attached',
      whatsAppNumber: 'Please check the phone number supplied',
    } as {[key: string]: any};

    if (!customer.mobile) {
      Alert.alert(
        'Info',
        'Please select a customer to share receipt with via Whatsapp',
      );
    } else {
      try {
        await Share.shareSingle(shareOptions);
      } catch (e) {
        Alert.alert('Error', errorMessages[e.error]);
      }
    }
  }, [customer.mobile, customer.name]);

  const handlePrintReceipt = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Receipt printing is coming in the next release',
    );
  }, []);

  const handleRemovePayment = useCallback(
    (type: 'cash' | 'transfer' | 'mobile') => {
      const result = payments.filter((item) => item.method !== type);
      setPayments(result);
    },
    [payments],
  );

  const handleSubmitPayment = useCallback(
    (payment: Payment) => {
      setPayments([...payments, payment]);
    },
    [payments],
  );

  const handlePaymentMethodAmountChange = useCallback(
    (text: string, type: 'cash' | 'transfer' | 'mobile') => {
      const result = payments.map((item) => {
        if (item.method === type) {
          return {...item, amount: parseFloat(text)};
        }
        return item;
      });
      setPayments(result);
    },
    [payments],
  );

  const getPaymentMethodAmount = useCallback(
    (type: 'cash' | 'transfer' | 'mobile') => {
      const method = payments.find((item) => item.method === type);
      if (method) {
        return method.amount.toString();
      }
      return '0';
    },
    [payments],
  );

  const handleCustomerSelect = useCallback(
    ({customer: customerData}) => {
      setCustomer(customerData);
    },
    [setCustomer],
  );

  const handleSetCustomer = useCallback((value: ICustomer) => {
    setCustomer(value);
  }, []);

  const handleFinish = () => {
    handleOpenSuccessModal();
  };

  const handleSaveReceipt = useCallback(
    (callback: () => void, onSuccess?: () => void) => {
      setTimeout(() => {
        callback();
        saveReceipt({
          tax,
          realm,
          payments,
          customer,
          amountPaid,
          totalAmount,
          creditAmount,
          receiptItems: products,
        });
        onClearReceipt();
        onSuccess && onSuccess();
      }, 500);
    },
    [
      amountPaid,
      creditAmount,
      customer,
      onClearReceipt,
      payments,
      products,
      realm,
      totalAmount,
    ],
  );

  const handleComplete = useCallback(() => {
    setIsCompleting(true);
    handleSaveReceipt(
      () => setIsCompleting(false),
      () => {
        navigation.navigate('Finances', {screen: 'Receipts'});
      },
    );
  }, [handleSaveReceipt, navigation]);

  const handleNewReceiptClick = useCallback(() => {
    setIsSaving(true);
    handleSaveReceipt(
      () => setIsSaving(false),
      () => {
        onCloseSummaryModal();
        handleCloseSuccessModal();
      },
    );
  }, [onCloseSummaryModal, handleCloseSuccessModal, handleSaveReceipt]);

  useEffect(() => {
    const total = products
      .map(({quantity, price}) => {
        const itemPrice = price ? price : 0;
        const itemQuantity = quantity ? quantity : 0;
        return itemPrice * itemQuantity;
      })
      .reduce((acc, curr) => acc + curr, 0);

    setTotalAmount(total);
    setAmountPaid(total);
  }, [products]);

  useEffect(() => {
    if (payments.length) {
      const paid = payments.reduce((acc, item) => acc + item.amount, 0);
      setAmountPaid(paid);
    }
  }, [payments, totalAmount]);

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => (
      <SummaryTableItem onPress={handleOpenEditProductModal} item={item} />
    ),
    [handleOpenEditProductModal],
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView style={styles.scrollView} nestedScrollEnabled>
        <View>
          <Text style={applyStyles('pb-xs', styles.sectionTitle)}>
            Products
          </Text>
          <Text
            style={applyStyles('text-400', 'mb-xl', {
              color: colors['gray-300'],
            })}>
            Total{' '}
            <Text style={applyStyles('text-700')}>
              &#8358;{numberWithCommas(totalAmount)}
            </Text>
          </Text>
          <View>
            <FlatList
              data={products}
              nestedScrollEnabled
              renderItem={renderSummaryItem}
              keyExtractor={(item) => `${item.id}`}
              ListHeaderComponent={SummaryTableHeader}
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
                    {tax}
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
                    &#8358;{numberWithCommas(totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
            <Button variantColor="white" onPress={handleAddProduct}>
              <View style={styles.addProductButton}>
                <Icon
                  size={24}
                  name="plus"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  Add product
                </Text>
              </View>
            </Button>
          </View>
        </View>
        <View style={applyStyles({marginVertical: 24})}>
          <Text style={applyStyles('pb-xs', styles.sectionTitle)}>Payment</Text>
          <Text
            style={applyStyles('text-400', 'mb-xl', {
              color: colors['gray-100'],
            })}>
            Select one or more payment methods
          </Text>
          {payments.map((item) => item.method).includes('cash') ? (
            <View style={applyStyles('mb-xs')}>
              <View style={applyStyles('pb-sm')}>
                <CurrencyInput
                  label="Cash Payment"
                  value={getPaymentMethodAmount('cash')}
                  onChange={(text) =>
                    handlePaymentMethodAmountChange(text.toString(), 'cash')
                  }
                  leftIcon={
                    <Text
                      style={applyStyles(styles.textInputIconText, 'text-400')}>
                      &#8358;
                    </Text>
                  }
                />
              </View>
              <Button
                variantColor="clear"
                onPress={() => handleRemovePayment('cash')}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                  )}>
                  <Icon
                    size={24}
                    name="trash-2"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                      color: colors.primary,
                    })}>
                    Delete payment
                  </Text>
                </View>
              </Button>
            </View>
          ) : (
            <Button
              variantColor="white"
              style={applyStyles('mb-md')}
              onPress={() => handleOpenPaymentModal('cash')}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                )}>
                <Icon
                  size={24}
                  type="feathericons"
                  name="dollar-sign"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  Add cash payment
                </Text>
              </View>
            </Button>
          )}
          {payments.map((item) => item.method).includes('transfer') ? (
            <View style={applyStyles('mb-xs')}>
              <View style={applyStyles('pb-sm')}>
                <CurrencyInput
                  label="Bank Transfer"
                  value={getPaymentMethodAmount('transfer')}
                  onChange={(text) =>
                    handlePaymentMethodAmountChange(text.toString(), 'transfer')
                  }
                  leftIcon={
                    <Text
                      style={applyStyles(styles.textInputIconText, 'text-400')}>
                      &#8358;
                    </Text>
                  }
                />
              </View>
              <Button
                variantColor="clear"
                onPress={() => handleRemovePayment('transfer')}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                  )}>
                  <Icon
                    size={24}
                    name="trash-2"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                      color: colors.primary,
                    })}>
                    Delete payment
                  </Text>
                </View>
              </Button>
            </View>
          ) : (
            <Button
              variantColor="white"
              style={applyStyles('mb-md')}
              onPress={() => handleOpenPaymentModal('transfer')}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                )}>
                <Icon
                  size={24}
                  name="repeat"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  Add bank transfer
                </Text>
              </View>
            </Button>
          )}
          {payments.map((item) => item.method).includes('mobile') ? (
            <View style={applyStyles('mb-xs')}>
              <View style={applyStyles('pb-sm')}>
                <CurrencyInput
                  label="Mobile Money"
                  value={getPaymentMethodAmount('mobile')}
                  onChange={(text) =>
                    handlePaymentMethodAmountChange(text.toString(), 'mobile')
                  }
                  leftIcon={
                    <Text
                      style={applyStyles(styles.textInputIconText, 'text-400')}>
                      &#8358;
                    </Text>
                  }
                />
              </View>
              <Button
                variantColor="clear"
                onPress={() => handleRemovePayment('mobile')}>
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                  )}>
                  <Icon
                    size={24}
                    name="trash-2"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                      color: colors.primary,
                    })}>
                    Delete payment
                  </Text>
                </View>
              </Button>
            </View>
          ) : (
            <Button
              variantColor="white"
              style={applyStyles('mb-md')}
              onPress={() => handleOpenPaymentModal('mobile')}>
              <View
                style={applyStyles(
                  'flex-row',
                  'items-center',
                  'justify-center',
                )}>
                <Icon
                  size={24}
                  name="smartphone"
                  type="feathericons"
                  color={colors.primary}
                />
                <Text
                  style={applyStyles('text-400', 'pl-md', 'text-uppercase', {
                    color: colors['gray-200'],
                  })}>
                  Add mobile money
                </Text>
              </View>
            </Button>
          )}
        </View>
        {!!creditAmount && (
          <View style={applyStyles({marginBottom: 80})}>
            <FloatingLabelInput
              editable={false}
              label="Remaining Balance"
              keyboardType="number-pad"
              inputStyle={applyStyles({color: colors.primary})}
              value={numberWithCommas(creditAmount)}
              leftIcon={
                <Text
                  style={applyStyles(
                    styles.textInputIconText,
                    {color: colors.primary},
                    'text-400',
                  )}>
                  &#8358;
                </Text>
              }
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variantColor="clear"
          onPress={handleCancel}
          style={styles.actionButton}
        />
        <Button
          title="Done"
          variantColor="red"
          onPress={handleFinish}
          isLoading={isCompleting}
          style={styles.actionButton}
        />
      </View>
      <ReceiptStatusModal
        customer={customer}
        isSaving={isSaving}
        timeTaken={timeTaken}
        amountPaid={amountPaid}
        creditAmount={creditAmount}
        onComplete={handleComplete}
        isCompleting={isCompleting}
        visible={isSuccessModalOpen}
        onPrintReceipt={handlePrintReceipt}
        onOpenShareModal={handleOpenShareModal}
        onNewReceiptClick={handleNewReceiptClick}
        onOpenCustomerModal={handleOpenCustomerModal}
      />
      <CustomerDetailsModal
        customer={customer}
        visible={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSelectCustomer={handleSetCustomer}
        onOpenContactList={handleOpenContactList}
      />
      <ShareReceiptModal
        visible={isShareModalOpen}
        onSmsShare={handleSmsShare}
        onEmailShare={handleEmailShare}
        onClose={handleCloseShareModal}
        onWhatsappShare={handleWhatsappShare}
      />
      <Modal visible={isContactListModalOpen}>
        <Receipts
          onModalClose={handleCloseContactList}
          onCustomerSelect={handleCustomerSelect}
        />
      </Modal>
      <PaymentMethodModal
        type={paymentType}
        visible={isPaymentModalOpen}
        onSubmit={handleSubmitPayment}
        onClose={handleClosePaymentModal}
        amount={
          amountPaid === totalAmount ? totalAmount : totalAmount - amountPaid
        }
      />
      <EditProductModal
        item={selectedProduct}
        visible={!!selectedProduct}
        onClose={handleCloseEditProductModal}
        onRemoveProductItem={onRemoveProductItem}
        onUpdateProductItem={onUpdateProductItem}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: 'Rubik-Medium',
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
  addProductButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});

export default ReceiptSummary;
