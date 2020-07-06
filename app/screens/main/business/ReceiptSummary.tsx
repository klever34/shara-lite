import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Button} from '../../../components/Button';
import Icon from '../../../components/Icon';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {applyStyles} from '../../../helpers/utils';
import {colors} from '../../../styles';

type Customer = {
  name: string;
  mobile: string;
};

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
    fontWeight: 'bold',
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
  },
  subText: {
    fontSize: 12,
    color: colors['gray-700'],
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
        <Text style={summaryTableItemStyles.subText}>N{price} Per Unit</Text>
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
        <Text style={summaryTableItemStyles.text}>N{subtotal}</Text>
      </View>
    </View>
  );
};

const ReceiptSummary = ({route}: any) => {
  const navigation = useNavigation();
  const products: ReceiptItem[] = route.params.products;
  const [customer, setCustomer] = useState<Customer>({} as Customer);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const handleFinish = useCallback(() => {}, []);

  const handleCancel = useCallback(() => {}, []);

  const handleAddProduct = useCallback(() => {
    navigation.navigate('NewReceipt');
  }, [navigation]);

  const handleUpdateCustomer = useCallback(
    (value, key) => {
      setCustomer({...customer, [key]: value});
    },
    [customer],
  );

  const renderSummaryItem = useCallback(
    ({item}: SummaryTableItemProps) => <SummaryTableItem item={item} />,
    [],
  );

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.sectionTitle}>Products</Text>
        <View>
          <FlatList
            data={products}
            style={styles.productsList}
            renderItem={renderSummaryItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={SummaryTableHeader}
          />
          <View style={styles.totalSection}>
            <View
              style={applyStyles(
                'pb-sm',
                'flex-row',
                'items-center',
                'justify-space-between',
              )}>
              <Text>Tax:</Text>
              <Text>0</Text>
            </View>
            <View
              style={applyStyles(
                'flex-row',
                'items-center',
                'justify-space-between',
              )}>
              <Text>Total:</Text>
              <Text style={styles.totalAmountText}>N0</Text>
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
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    paddingBottom: 12,
    color: colors.primary,
  },
  totalSection: {
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors['gray-20'],
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productsList: {
    height: 200,
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
  },
  actionButtons: {
    marginTop: 8,
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
    borderBottomColor: colors['gray-700'],
  },
});

export default ReceiptSummary;
