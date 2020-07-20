import {Picker} from '@react-native-community/picker';
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
} from 'react-native';
import {MainStackParamList} from '..';
import {Button} from '../../../components/Button';
import {FloatingLabelInput} from '../../../components/FloatingLabelInput';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {ICustomer} from '../../../models';
import {savePayment} from '../../../services/PaymentService';
import {useRealm} from '../../../services/realm';
import {colors} from '../../../styles';
import Receipts from './Receipts';

type SummaryTableItemProps = {
  item: ReceiptItem;
};

type CreditPayload = {
  amount: string;
  paymentMethod: string | number;
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

const paymentTypes = ['Cash', 'Bank Transfer', 'Mobile Money'];

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

  const [paymentType, setPaymentType] = useState(paymentTypes[0]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const creditAmount = totalAmount - amountPaid;

  const [customer, setCustomer] = useState<Customer | ICustomer>(
    customerProps || ({} as Customer),
  );
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(
    false,
  );

  const handleToggleCustomerModal = useCallback(() => {
    setIsCustomerModalOpen((isNodalOpen) => !isNodalOpen);
  }, []);

  const handleCustomerSelect = useCallback(
    ({customer: customerData}) => {
      setCustomer(customerData);
      handleToggleCustomerModal();
    },
    [setCustomer, handleToggleCustomerModal],
  );

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

  const handleUpdateCustomer = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  const handlePaymentTypeChange = useCallback((value: string | number) => {
    setPaymentType(value.toString());
  }, []);

  const handleAmountPaidChange = useCallback((value: string | number) => {
    // @TODO Improve conversion
    setAmountPaid(parseFloat(value.toString().replace(/,/g, '')));
  }, []);

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
      navigation.navigate('StatusModal', {
        status: 'success',
        onClick: handleCancel,
        text: `You have successfully issued a receipt for N${numberWithCommas(
          amountPaid,
        )} in Cash and N${numberWithCommas(creditAmount)} in Credit`,
      });
    }, 2000);
  };

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

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView style={styles.scrollView} nestedScrollEnabled>
        <View>
          <Text style={styles.sectionTitle}>Products</Text>
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
            <Touchable onPress={handleAddProduct}>
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
                <Text style={styles.addProductButtonText}>Add a product</Text>
              </View>
            </Touchable>
          </View>
        </View>
        <View>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View>
            <FloatingLabelInput
              containerStyle={styles.input}
              value={customer.mobile}
              keyboardType="phone-pad"
              label="Customer Phone Number"
              onChangeText={(item) => handleUpdateCustomer(item, 'mobile')}
            />
            <FloatingLabelInput
              containerStyle={styles.input}
              value={customer.name}
              label="Customer Name"
              onChangeText={(item) => handleUpdateCustomer(item, 'name')}
            />
          </View>
          <View style={styles.selectCustomerButton}>
            <Button
              variantColor="red"
              title="Select customer"
              style={applyStyles('w-full')}
              onPress={handleToggleCustomerModal}
            />
          </View>
          <Modal
            animationType="slide"
            transparent={false}
            visible={isCustomerModalOpen}>
            <Receipts
              onCustomerSelect={handleCustomerSelect}
              onModalClose={handleToggleCustomerModal}
            />
          </Modal>
        </View>
        <View style={applyStyles({marginTop: 40, marginBottom: 100})}>
          <View style={styles.pickerContainer}>
            <Text style={applyStyles('text-400', styles.pickerLabel)}>
              Payment method
            </Text>
            <Picker
              mode="dropdown"
              style={styles.picker}
              prompt="Payment Method"
              itemStyle={styles.pickerItem}
              selectedValue={paymentType}
              onValueChange={(itemValue) => handlePaymentTypeChange(itemValue)}>
              {paymentTypes.map((type: string, index) => (
                <Picker.Item label={type} value={type} key={index} />
              ))}
            </Picker>
          </View>
          <View style={applyStyles('flex-row', 'items-center')}>
            <FloatingLabelInput
              label="Amount Paid"
              keyboardType="number-pad"
              containerStyle={applyStyles({marginBottom: 32})}
              value={numberWithCommas(amountPaid)}
              onChangeText={(text) => handleAmountPaidChange(text)}
              leftIcon={
                <Text style={applyStyles(styles.textInputIconText, 'text-400')}>
                  &#8358;
                </Text>
              }
            />
          </View>
          {creditAmount > 0 && (
            <FloatingLabelInput
              editable={false}
              label="Credit remaining"
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
          )}
        </View>
      </ScrollView>
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variantColor="clear"
          onPress={handleCancel}
          style={styles.actionButton}
        />
        <Button
          title="Finish"
          variantColor="red"
          onPress={handleFinish}
          isLoading={isSubmitting}
          style={styles.actionButton}
        />
      </View>
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
    paddingBottom: 12,
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
    marginBottom: 24,
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
    borderTopColor: colors['gray-20'],
    borderBottomColor: colors['gray-20'],
  },
  selectCustomerButton: {
    marginBottom: 24,
  },
  addProductButtonText: {
    paddingLeft: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Rubik-Regular',
  },
  signatureContainer: {
    height: 100,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    borderColor: colors['gray-20'],
  },
  customerSignature: {
    height: '100%',
    width: '100%',
  },
  customerSignatureText: {
    fontSize: 12,
    textAlign: 'center',
    color: colors['gray-300'],
  },
  actionButtons: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
  },
  input: {
    marginBottom: 16,
  },
  buttonStyle: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextStyle: {
    fontSize: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 40,
    borderBottomWidth: 1,
    borderColor: colors['gray-200'],
  },
  pickerLabel: {
    color: colors['gray-100'],
  },
  picker: {
    paddingBottom: 12,
    fontFamily: 'Rubik-Regular',
  },
  pickerItem: {
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
  },
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  creditText: {
    marginTop: 3,
    color: colors.primary,
  },
});

export default ReceiptSummary;
