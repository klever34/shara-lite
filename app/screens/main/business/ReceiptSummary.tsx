import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import {MainStackParamList} from '..';
import {Button} from '../../../components';
import {FloatingLabelInput} from '../../../components';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {ICustomer} from '../../../models';
import {savePayment} from '../../../services/PaymentService';
import {useRealm} from '../../../services/realm';
import {colors} from '../../../styles';
import {CustomerDetailsModal} from './CustomerDetailsModal';
import {PaymentMethodModal} from './PaymentMethodModal';
import Receipts from './Receipts';
import {ReceiptStatusModal} from './ReceiptStatusModal';
import {ShareReceiptModal} from './ShareReceiptModal';

type SummaryTableItemProps = {
  item: ReceiptItem;
};

const summaryTableStyles = StyleSheet.create({
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

const summaryTableHeaderStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-900'],
  },
  text: {
    fontFamily: 'Rubik-Medium',
    color: colors['gray-300'],
  },
});

const summaryTableItemStyles = StyleSheet.create({
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

const SummaryTableHeader = () => {
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
        <Text style={summaryTableHeaderStyles.text}>Qty</Text>
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

const SummaryTableItem = ({item}: SummaryTableItemProps) => {
  const price = item.price ? parseFloat(item.price) : 0;
  const quantity = item.quantity ? parseFloat(item.quantity) : 0;
  const subtotal = price * quantity;

  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
      <View style={summaryTableStyles['column-40']}>
        <Text style={summaryTableItemStyles.text}>
          {item.name} ({item.weight})
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
    </View>
  );
};

const ReceiptSummary = ({
  route,
}: StackScreenProps<MainStackParamList, 'ReceiptSummary'>) => {
  const navigation = useNavigation();
  const realm = useRealm();

  const {customer: customerProps, products} = route.params;
  const tax = 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<
    'cash' | 'transfer' | 'mobile'
  >('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customer, setCustomer] = useState<Customer | ICustomer>(
    customerProps || ({} as Customer),
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const creditAmount = totalAmount - amountPaid;

  //@ts-ignore
  const timeTaken = new Date().getTime() - global.startTime;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const handleCancel = useCallback(() => {
    navigation.navigate('NewReceipt');
  }, [navigation]);

  const handleAddProduct = useCallback(() => {
    navigation.navigate('NewReceipt');
  }, [navigation]);

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

  const handleSmsShare = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Receipt sharing via SMS is coming in the next release',
    );
  }, []);

  const handleEmailShare = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Receipt sharing via Email is coming in the next release',
    );
  }, []);

  const handleWhatsappShare = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Receipt sharing via Whatsapp is coming in the next release',
    );
  }, []);

  const handlePrintReceipt = useCallback(() => {
    Alert.alert(
      'Coming soon',
      'Receipt printing is coming in the next release',
    );
  }, []);

  const handleRemovePayment = useCallback(
    (type: 'cash' | 'transfer' | 'mobile') => {
      const result = payments.filter((item) => item.paymentMethod !== type);
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
        if (item.paymentMethod === type) {
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
      const paymentMethod = payments.find(
        (item) => item.paymentMethod === type,
      );
      if (paymentMethod) {
        return paymentMethod.amount.toString();
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

  const handleUpdateCustomer = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  const handleFinish = () => {
    setIsSubmitting(true);
    savePayment({
      realm,
      customer,
      type: paymentType,
      amountPaid,
      totalAmount,
      creditAmount,
      tax,
      products,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      handleOpenSuccessModal();
    }, 2000);
  };

  const handleComplete = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleCloseSuccessModal();
      navigation.navigate('NewReceipt');
    }, 2000);
  }, [navigation, handleCloseSuccessModal]);

  useEffect(() => {
    const total = products
      .map(({quantity, price}) => {
        const itemPrice = price ? parseFloat(price) : 0;
        const itemQuantity = quantity ? parseFloat(quantity) : 0;
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
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
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
              color: colors['gray-100'],
            })}>
            Here is a list of products being purchased
          </Text>
          <View>
            <FlatList
              data={products}
              nestedScrollEnabled
              renderItem={renderSummaryItem}
              keyExtractor={(item) => item.id}
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
                  <Text>{tax}</Text>
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
                  type="ionicons"
                  name={
                    Platform.select({
                      android: 'md-add',
                      ios: 'ios-add',
                    }) as string
                  }
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
          {payments.map((item) => item.paymentMethod).includes('cash') ? (
            <View style={applyStyles('mb-xs')}>
              <View style={applyStyles('pb-sm')}>
                <FloatingLabelInput
                  label="Cash Payment"
                  value={getPaymentMethodAmount('cash')}
                  keyboardType="numbers-and-punctuation"
                  onChangeText={(text) =>
                    handlePaymentMethodAmountChange(text, 'cash')
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
          {payments.map((item) => item.paymentMethod).includes('transfer') ? (
            <View style={applyStyles('mb-xs')}>
              <View style={applyStyles('pb-sm')}>
                <FloatingLabelInput
                  label="Bank Transfer"
                  keyboardType="numbers-and-punctuation"
                  value={getPaymentMethodAmount('transfer')}
                  onChangeText={(text) =>
                    handlePaymentMethodAmountChange(text, 'transfer')
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
          {payments.map((item) => item.paymentMethod).includes('mobile') ? (
            <View style={applyStyles('mb-xs')}>
              <View style={applyStyles('pb-sm')}>
                <FloatingLabelInput
                  label="Mobile Money"
                  keyboardType="numbers-and-punctuation"
                  value={getPaymentMethodAmount('mobile')}
                  onChangeText={(text) =>
                    handlePaymentMethodAmountChange(text, 'mobile')
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
          isLoading={isSubmitting}
          style={styles.actionButton}
        />
      </View>
      <ReceiptStatusModal
        customer={customer}
        timeTaken={timeTaken}
        amountPaid={amountPaid}
        creditAmount={creditAmount}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
        visible={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        onPrintReceipt={handlePrintReceipt}
        onOpenShareModal={handleOpenShareModal}
        onOpenCustomerModal={handleOpenCustomerModal}
      />
      <CustomerDetailsModal
        customer={customer}
        visible={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onUpdateCustomer={handleUpdateCustomer}
        onOpenContactList={handleOpenContactList}
      />
      <ShareReceiptModal
        visible={isShareModalOpen}
        onClose={handleCloseShareModal}
        onSmsShare={handleSmsShare}
        onEmailShare={handleEmailShare}
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
