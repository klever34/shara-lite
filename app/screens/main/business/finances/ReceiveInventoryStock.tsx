import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  FlatList,
  Modal as ReactNativeModal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {InventoryStockItem} from '../../../../../types/app';
import {
  Button,
  CurrencyInput,
  FloatingLabelInput,
} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
import Icon from '../../../../components/Icon';
import SearchableDropdown from '../../../../components/SearchableDropdown';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {IProduct} from '../../../../models/Product';
import {getProducts} from '../../../../services/ProductService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import {MainStackParamList} from '../../index';
import {ReceiveInventoryStockSummary} from './ReceiveInventoryStockSummary';
import {ReceiveInventoryStockPreview} from './ReceiveInventoryStockPreview';

type RecentProductItemProps = {
  item: IProduct;
};

export const ReceiveInventoryStock = ({
  route,
}: StackScreenProps<MainStackParamList, 'ReceiveInventoryStock'>) => {
  const realm = useRealm();
  const navigation = useNavigation();
  const products = getProducts({realm});
  const {supplier} = route.params;

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [price, setPrice] = useState<string | undefined>('');
  const [inventoryStock, setInventoryStock] = useState<InventoryStockItem[]>(
    [],
  );
  const [quantity, setQuantity] = useState<string | undefined>('');
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isProductsPreviewModalOpen, setIsProductsPreviewModalOpen] = useState(
    false,
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  const handleAddItem = useCallback(() => {
    if (price && quantity) {
      const product = {
        supplier,
        quantity,
        cost_price: price,
        product: selectedProduct,
      } as InventoryStockItem;
      setInventoryStock([product, ...inventoryStock]);
      setSelectedProduct(null);
      setPrice('');
      setQuantity('');
    }
  }, [price, quantity, inventoryStock, selectedProduct, supplier]);

  const handlePriceChange = useCallback((item) => {
    setPrice(item);
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleSelectProduct = useCallback((item: IProduct) => {
    setSelectedProduct(item);
  }, []);

  const handleOpenSummaryModal = useCallback(() => {
    setIsSummaryModalOpen(true);
  }, []);

  const handleCloseSummaryModal = useCallback(() => {
    setIsSummaryModalOpen(false);
  }, []);

  const handleOpenProductsPreviewModal = useCallback(() => {
    setIsProductsPreviewModalOpen(true);
  }, []);

  const handleCloseProductsPreviewModal = useCallback(() => {
    setIsProductsPreviewModalOpen(false);
  }, []);

  const handleCloseProductModal = useCallback(() => {
    setSelectedProduct(null);
    setQuantity('');
  }, []);

  const handleClearReceipt = useCallback(() => {
    setInventoryStock([]);
    handleCloseSummaryModal();
  }, [handleCloseSummaryModal]);

  const handleDone = useCallback(() => {
    let items = inventoryStock;
    if (selectedProduct && quantity && price) {
      const product = {
        quantity,
        supplier,
        cost_price: price,
        product: selectedProduct,
      } as InventoryStockItem;

      // handleAddItem();
      items = [product, ...inventoryStock];
    }
    setInventoryStock(items);
    setSelectedProduct(null);
    handleOpenSummaryModal();
  }, [
    inventoryStock,
    selectedProduct,
    quantity,
    price,
    handleOpenSummaryModal,
    supplier,
    // handleAddItem,
  ]);

  const renderRecentProducts = useCallback(
    ({item: product}: RecentProductItemProps) => {
      return (
        <Touchable onPress={() => handleSelectProduct(product)}>
          <View style={styles.recentProductItem}>
            <Text style={applyStyles(styles.recentProductItemText, 'text-400')}>
              {product.sku} - {product.name}{' '}
              {product.weight ? `(${product.weight}))` : ''}
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
        Products list
      </Text>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <SearchableDropdown
        items={products}
        searchTerm="name"
        onItemSelect={handleSelectProduct}
        noResultsActionButtonText="Add a product"
        textInputProps={{placeholder: 'Search Products'}}
        noResultsAction={() => navigation.navigate('AddProduct')}
        emptyStateText="We don't have this item in our database, you can help us update our system by adding it as a new item."
      />
      <FlatList
        data={products}
        style={styles.recentProductsList}
        renderItem={renderRecentProducts}
        ListHeaderComponent={renderRecentProductsHeader}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListEmptyComponent={
          <View
            style={applyStyles('px-lg flex-1 items-center justify-center', {
              paddingVertical: 100,
            })}>
            <Text
              style={applyStyles('mb-xs heading-700', 'text-center', {
                color: colors['gray-300'],
              })}>
              No products found
            </Text>
            <Button
              title="Add Products"
              variantColor="clear"
              style={applyStyles('w-full')}
              onPress={() => navigation.navigate('AddProduct')}
            />
          </View>
        }
      />
      <Modal
        isVisible={!!selectedProduct}
        onSwipeComplete={handleCloseProductModal}
        onBackButtonPress={handleCloseProductModal}
        style={applyStyles({
          margin: 0,
          justifyContent: 'flex-end',
        })}>
        <View style={styles.calculatorSection}>
          <Touchable onPress={handleOpenProductsPreviewModal}>
            <View>
              <Text
                style={applyStyles(styles.receiptItemsCountText, 'text-400')}>
                You have added{' '}
                <Text style={styles.receiptItemsCount}>
                  {inventoryStock?.length}
                </Text>{' '}
                Products to your inventory
              </Text>
              {!!inventoryStock.length && (
                <View
                  style={applyStyles(
                    'flex-row',
                    'items-center',
                    'justify-center',
                  )}>
                  <Icon
                    size={24}
                    name="eye"
                    type="feathericons"
                    color={colors.primary}
                  />
                  <Text
                    style={applyStyles('pl-sm', 'text-400', 'text-uppercase', {
                      color: colors.primary,
                    })}>
                    Tap to preview products
                  </Text>
                </View>
              )}
            </View>
          </Touchable>
          <View>
            <>
              <Text
                style={applyStyles(
                  styles.calculatorSectionHelperText,
                  'text-500',
                )}>
                Adding this product to receipt
              </Text>
              <Text style={applyStyles(styles.selectedProductName, 'text-700')}>
                {selectedProduct?.name}{' '}
                {selectedProduct?.weight ? `${selectedProduct.weight}` : ''}
              </Text>
              <View style={styles.calculatorSectionInputs}>
                <View
                  style={applyStyles('mb-lg text-400', {
                    width: '100%',
                  })}>
                  <FloatingLabelInput
                    value={quantity}
                    label="Quantity"
                    keyboardType="numeric"
                    onChangeText={handleQuantityChange}
                  />
                </View>
                <View
                  style={applyStyles('flex-row', 'items-center', {
                    width: '100%',
                  })}>
                  <CurrencyInput
                    value={price}
                    label="Cost Price"
                    onChange={handlePriceChange}
                  />
                </View>
              </View>
            </>
          </View>
        </View>
        <View style={styles.calculatorSectionButtons}>
          <Button
            variantColor="white"
            title="Add next item"
            onPress={handleAddItem}
            style={styles.calculatorSectionButton}
          />
          <Button
            title="Done"
            variantColor="red"
            onPress={handleDone}
            style={styles.calculatorSectionButton}
          />
        </View>
      </Modal>

      <View style={styles.calculatorSection}>
        {!selectedProduct && (
          <Text style={applyStyles(styles.receiptItemsCountText, 'text-400')}>
            You have add{' '}
            <Text style={styles.receiptItemsCount}>
              {inventoryStock?.length}
            </Text>{' '}
            Products to your inventory
          </Text>
        )}
        {!!inventoryStock.length && (
          <Button
            title="Done"
            variantColor="red"
            onPress={handleDone}
            style={applyStyles('my-sm', 'w-full')}
          />
        )}
      </View>

      <ReactNativeModal visible={isSummaryModalOpen}>
        <ReceiveInventoryStockSummary
          products={inventoryStock}
          onClearReceipt={handleClearReceipt}
          onCloseSummaryModal={handleCloseSummaryModal}
        />
      </ReactNativeModal>
      <ReceiveInventoryStockPreview
        products={inventoryStock}
        visible={isProductsPreviewModalOpen}
        onClose={handleCloseProductsPreviewModal}
      />
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
    backgroundColor: colors.white,
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
  },
  calculatorSectionButtons: {
    borderTopWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  calculatorSectionButton: {
    width: '48%',
  },
  inputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});
