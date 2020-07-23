import {Picker} from '@react-native-community/picker';
import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';
import {MainStackParamList} from '..';
import {Button} from '../../../components/Button';
import {ContactsListModal} from '../../../components/ContactsListModal';
import {FloatingLabelInput} from '../../../components/FloatingLabelInput';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {
  applyStyles,
  generateUniqueId,
  numberWithCommas,
} from '../../../helpers/utils';
import {ICustomer} from '../../../models';
import {savePayment} from '../../../services/PaymentService';
import {useRealm} from '../../../services/realm';
import {colors} from '../../../styles';
import {CustomerDetailsModal} from './CustomerDetailsModal';
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
  const [customer, setCustomer] = useState<Customer | ICustomer>(
    customerProps || ({} as Customer),
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
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

  const handlePaymentTypeChange = useCallback((value: string | number) => {
    setPaymentType(value.toString());
  }, []);

  const handleAmountPaidChange = useCallback((value: string | number) => {
    // @TODO Improve conversion
    setAmountPaid(parseFloat(value.toString().replace(/,/g, '')));
  }, []);

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

  const handleCustomerSelect = useCallback(
    ({givenName, familyName, phoneNumbers}: Contact) => {
      setCustomer({
        created_at: new Date(),
        id: generateUniqueId(),
        mobile: phoneNumbers[0].number,
        name: `${givenName} ${familyName}`,
      });
    },
    [setCustomer],
  );

  const handleUpdateCustomer = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  const handleOpenContactList = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactList = useCallback(() => {
    setIsContactListModalOpen(false);
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
        <View style={applyStyles({marginVertical: 24})}>
          <View style={styles.pickerContainer}>
            <Text style={applyStyles('text-400', styles.pickerLabel)}>
              Select Payment method
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
              containerStyle={applyStyles({marginBottom: 12})}
              value={numberWithCommas(amountPaid)}
              onChangeText={(text) => handleAmountPaidChange(text)}
              leftIcon={
                <Text style={applyStyles(styles.textInputIconText, 'text-400')}>
                  &#8358;
                </Text>
              }
            />
          </View>
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
        </View>

        <View style={applyStyles({marginBottom: 40})}>
          <View
            style={applyStyles('items-center, justify-center', {
              marginBottom: 16,
            })}>
            <Text
              style={applyStyles('text-400', 'text-center', {
                color: colors['gray-100'],
              })}>
              Are they paying via multiple methods?
            </Text>
          </View>

          <Touchable onPress={handleAddProduct}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center', {
                paddingVertical: 16,
              })}>
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
              <Text style={styles.addProductButtonText}>
                Add payment method
              </Text>
            </View>
          </Touchable>
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
          title="Done"
          variantColor="red"
          onPress={handleFinish}
          isLoading={isSubmitting}
          style={styles.actionButton}
        />
      </View>

      <ReceiptStatusModal
        timeTaken={timeTaken}
        amountPaid={amountPaid}
        creditAmount={creditAmount}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
        visible={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
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
      />

      <ContactsListModal
        visible={isContactListModalOpen}
        onClose={handleCloseContactList}
        onContactSelect={handleCustomerSelect}
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
    borderTopWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
    borderTopColor: colors['gray-20'],
    borderBottomColor: colors['gray-20'],
  },
  addPaymentButton: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    marginBottom: 12,
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
