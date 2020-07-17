import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import {Button} from '../../../components/Button';
import AppMenu from '../../../components/Menu';
import Touchable from '../../../components/Touchable';
import {colors} from '../../../styles';
import {products} from '../data.json';
import {MainStackParamList} from '..';
import {StackScreenProps} from '@react-navigation/stack';
import SearchableDropdown from '../../../components/SearchableDropdown';
import {applyStyles} from '../../../helpers/utils';
import Receipts from './Receipts';

type RecentProductItemProps = {
  item: Product;
};

const NewReceipt = ({
  route,
}: StackScreenProps<MainStackParamList, 'NewReceipt'>) => {
  const navigation = useNavigation();
  const [selectedProduct, setSelectedProduct] = useState<ReceiptItem | null>(
    null,
  );

  const [price, setPrice] = useState<string | undefined>('');
  const [quantity, setQuantity] = useState<string | undefined>('');
  const [receipt, setReceipt] = useState<ReceiptItem[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <AppMenu options={[]} />,
    });
  }, [navigation]);

  const handleAddItem = useCallback(() => {
    if (price && quantity) {
      const product: ReceiptItem = {
        ...selectedProduct,
        price,
        quantity,
      } as ReceiptItem;
      setReceipt([product, ...receipt]);
      setSelectedProduct(null);
      setPrice('');
      setQuantity('');
    }
  }, [price, quantity, receipt, selectedProduct]);

  const handlePriceChange = useCallback((item) => {
    setPrice(item);
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleSelectProduct = useCallback((item: Product) => {
    setSelectedProduct(item);
    setPrice(item?.price?.toString());
  }, []);

  const handleDone = useCallback(() => {
    let items = receipt;
    if (selectedProduct && quantity && price) {
      const product: ReceiptItem = {
        ...selectedProduct,
        price,
        quantity,
      } as ReceiptItem;

      handleAddItem();
      items = [product, ...receipt];
    }
    navigation.navigate('ReceiptSummary', {products: items});
  }, [receipt, selectedProduct, quantity, price, handleAddItem, navigation]);

  const renderRecentProducts = useCallback(
    ({item: product}: RecentProductItemProps) => {
      return (
        <Touchable onPress={() => handleSelectProduct(product)}>
          <View style={styles.recentProductItem}>
            <Text style={applyStyles(styles.recentProductItemText, 'text-400')}>
              {product.name} ({product.weight})
            </Text>
          </View>
        </Touchable>
      );
    },
    [handleSelectProduct],
  );

  const renderRecentProductsHeader = useCallback(
    () => (
      <Text style={applyStyles(styles.recentProductsHeader, 'text-500')}>
        Recent products
      </Text>
    ),
    [],
  );

  const getSubtotal = useCallback(() => {
    const p = price ? parseFloat(price) : 0;
    const q = quantity ? parseFloat(quantity) : 0;
    return (p * q).toString();
  }, [price, quantity]);

  return (
    <SafeAreaView style={styles.container}>
      <SearchableDropdown
        items={products}
        searchTerm="name"
        onItemSelect={handleSelectProduct}
        textInputProps={{placeholder: 'Search Products'}}
      />
      <FlatList
        data={products}
        style={styles.recentProductsList}
        renderItem={renderRecentProducts}
        ListHeaderComponent={renderRecentProductsHeader}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
      <View style={styles.calculatorSection}>
        <Text style={applyStyles(styles.receiptItemsCountText, 'text-400')}>
          You have{' '}
          <Text style={styles.receiptItemsCount}>{receipt?.length}</Text>{' '}
          Products in your receipt
        </Text>
        {(selectedProduct || !!receipt.length) && (
          <View>
            {selectedProduct && (
              <>
                <Text
                  style={applyStyles(
                    styles.calculatorSectionHelperText,
                    'text-500',
                  )}>
                  Adding this product to receipt
                </Text>
                <Text
                  style={applyStyles(styles.selectedProductName, 'text-700')}>
                  {selectedProduct?.name} ({selectedProduct?.weight})
                </Text>
                <View style={styles.calculatorSectionInputs}>
                  <View
                    style={applyStyles('flex-row', 'items-center', {
                      width: '48%',
                    })}>
                    <View style={styles.textInputIcon}>
                      <Text
                        style={applyStyles(
                          styles.textInputIconText,
                          'text-400',
                        )}>
                        &#8358;
                      </Text>
                    </View>
                    <TextInput
                      value={price}
                      keyboardType="numeric"
                      placeholder="Unit Price"
                      onChangeText={handlePriceChange}
                      style={applyStyles(
                        'flex-1',
                        'pl-lg',
                        'text-400',
                        styles.calculatorSectionInput,
                      )}
                    />
                  </View>
                  <TextInput
                    value={quantity}
                    keyboardType="numeric"
                    placeholder="Quantity"
                    onChangeText={handleQuantityChange}
                    style={applyStyles(
                      styles.calculatorSectionInput,
                      'text-400',
                      {
                        width: '48%',
                      },
                    )}
                  />
                </View>
                <View style={styles.calculatorSectionInputs}>
                  <View style={styles.textInputIcon}>
                    <Text
                      style={applyStyles(styles.textInputIconText, 'text-400')}>
                      &#8358;
                    </Text>
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Subtotal"
                    style={applyStyles(
                      'flex-1',
                      'pl-lg',
                      'text-400',
                      styles.calculatorSectionInput,
                    )}
                    value={getSubtotal()}
                  />
                </View>
              </>
            )}
            <View style={styles.calculatorSectionButtons}>
              <Button
                title="Done"
                variantColor="white"
                onPress={handleDone}
                style={styles.calculatorSectionButton}
              />
              <Button
                variantColor="red"
                title="Add next item"
                onPress={handleAddItem}
                style={styles.calculatorSectionButton}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  recentProductsHeader: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    color: colors['gray-300'],
    textTransform: 'uppercase',
    borderBottomColor: colors['gray-20'],
  },
  recentProductsList: {
    height: 200,
  },
  recentProductItem: {
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  recentProductItemText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  calculatorSection: {
    borderTopWidth: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopColor: colors['gray-20'],
  },
  receiptItemsCount: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  receiptItemsCountText: {
    fontSize: 12,
    textAlign: 'center',
    color: colors['gray-200'],
    textTransform: 'uppercase',
  },
  calculatorSectionHelperText: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
    paddingVertical: 12,
    borderTopWidth: 0.8,
    color: colors['gray-300'],
    textTransform: 'uppercase',
    borderTopColor: colors['gray-20'],
  },
  selectedProductName: {
    fontSize: 18,
    paddingBottom: 24,
    textAlign: 'center',
    color: colors.primary,
  },
  calculatorSectionInputs: {
    marginBottom: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calculatorSectionInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-700'],
  },
  calculatorSectionButtons: {
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calculatorSectionButton: {
    width: '48%',
  },
  textInputIcon: {
    position: 'absolute',
  },
  textInputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});

export default NewReceipt;
