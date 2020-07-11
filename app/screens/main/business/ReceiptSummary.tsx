import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {Picker} from '@react-native-community/picker';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {MainStackParamList} from '..';
import {Button} from '../../../components/Button';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {colors} from '../../../styles';

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
  const tax = 0;
  const {customer: customerProps, products} = route.params;
  const [creditPayload, setCreditPayload] = useState<CreditPayload>({
    paymentMethod: 'Credit',
  } as CreditPayload);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState(false);
  const [customer, setCustomer] = useState<Customer>(
    customerProps || ({} as Customer),
  );

  const ref = useRef<any>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const saveSign = useCallback(() => {
    ref.current.saveImage();
  }, []);

  const resetSign = useCallback(() => {
    ref.current.resetImage();
    setSignature(false);
  }, []);

  const onSaveEvent = useCallback((result: any) => {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name
    console.log(result);
  }, []);

  const onDragEvent = useCallback(() => {
    // This callback will be called when the user enters signature
    console.log('dragged');
    setSignature(true);
  }, []);

  const handleCancel = useCallback(() => {
    navigation.navigate('Receipts');
  }, [navigation]);

  const handleAddProduct = useCallback(() => {
    navigation.navigate('NewReceipt', {customer});
  }, [navigation, customer]);

  const handleUpdateCustomer = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  const handleCreditPayloadChange = useCallback(
    (value: string | number, key: keyof CreditPayload) => {
      setCreditPayload({
        ...creditPayload,
        [key]: value,
      });
    },
    [creditPayload],
  );

  const handleFinish = useCallback(() => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      saveSign();
      navigation.navigate('StatusModal', {
        status: 'success',
        onClick: handleCancel,
        text: `You have successfully issued a receipt to ${customer.name}`,
      });
    }, 2000);
  }, [saveSign, navigation, handleCancel, customer.name]);

  const getProductsTotalAmount = useCallback(() => {
    return products
      .map(({quantity, price}) => {
        const itemPrice = price ? parseFloat(price) : 0;
        const itemQuantity = quantity ? parseFloat(quantity) : 0;
        return itemPrice * itemQuantity;
      })
      .reduce((acc, curr) => acc + curr, 0);
  }, [products]);

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  const totalAmount = tax + getProductsTotalAmount();

  return (
    <ScrollView style={styles.container} nestedScrollEnabled>
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
          <TextInput
            style={styles.input}
            value={customer.mobile}
            keyboardType="phone-pad"
            placeholder="Customer Phone Number"
            onChangeText={(item) => handleUpdateCustomer(item, 'mobile')}
          />
          <TextInput
            style={styles.input}
            value={customer.name}
            placeholder="Customer Name"
            onChangeText={(item) => handleUpdateCustomer(item, 'name')}
          />
        </View>
        <View style={styles.signatureContainer}>
          <SignatureCapture
            ref={ref}
            showBorder={false}
            viewMode={'portrait'}
            showTitleLabel={false}
            onSaveEvent={onSaveEvent}
            onDragEvent={onDragEvent}
            showNativeButtons={false}
            saveImageFileInExtStorage={false}
            style={applyStyles('flex-1', styles.customerSignature)}
          />
        </View>
        <Text style={applyStyles(styles.customerSignatureText, 'text-500')}>
          Customer Signature
        </Text>
        <View
          style={applyStyles(
            'flex-1',
            'flex-row',
            'justify-center',
            'item-center',
          )}>
          {!!signature && (
            <Touchable
              style={styles.buttonStyle}
              onPress={() => {
                resetSign();
              }}>
              <Text style={applyStyles(styles.buttonTextStyle, 'text-400')}>
                Clear
              </Text>
            </Touchable>
          )}
        </View>
      </View>
      <View style={applyStyles({marginTop: 40})}>
        <View style={styles.pickerContainer}>
          <Text style={applyStyles('text-400', styles.pickerLabel)}>
            Payment method
          </Text>
          <Picker
            mode="dropdown"
            style={styles.picker}
            prompt="Payment Method"
            itemStyle={styles.pickerItem}
            selectedValue={creditPayload.paymentMethod}
            onValueChange={(itemValue) =>
              handleCreditPayloadChange(itemValue, 'paymentMethod')
            }>
            <Picker.Item label="Cash" value="Cash" />
            <Picker.Item label="Credit" value="Credit" />
          </Picker>
        </View>
        <View style={applyStyles('flex-row', 'items-center')}>
          <View style={styles.textInputIcon}>
            <Text style={applyStyles(styles.textInputIconText, 'text-400')}>
              &#8358;
            </Text>
          </View>
          <TextInput
            style={applyStyles('flex-1', 'pl-lg', 'text-400', styles.input)}
            keyboardType="number-pad"
            placeholder="Amount Paid"
            value={creditPayload.amount}
            placeholderTextColor={colors['gray-50']}
            onChangeText={(text) => handleCreditPayloadChange(text, 'amount')}
          />
        </View>
      </View>
      <View style={styles.actionButtons}>
        <Button
          title="Cancel"
          variantColor="white"
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
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
  addProductButtonText: {
    paddingLeft: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    fontFamily: 'Rubik-Regular',
  },
  signatureContainer: {
    height: 200,
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
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
  },
  input: {
    fontSize: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
    borderBottomColor: colors['gray-700'],
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
  textInputIcon: {
    top: 14,
    position: 'absolute',
  },
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});

export default ReceiptSummary;
