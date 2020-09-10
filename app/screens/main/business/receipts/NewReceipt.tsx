import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal as ReactNativeModal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  Button,
  CurrencyInput,
  FloatingLabelInput,
} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
import Icon from '../../../../components/Icon';
import SearchableDropdown from '../../../../components/SearchableDropdown';
import Touchable from '../../../../components/Touchable';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {IProduct} from '../../../../models/Product';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {getAuthService} from '../../../../services';
import {getProducts} from '../../../../services/ProductService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import {ProductsPreviewModal} from './ProductsPreviewModal';
import ReceiptSummary from './ReceiptSummary';
import {useScreenRecord} from '../../../../services/analytics';
import {FormDefaults} from '@/services/FormDefaults';

type RecentProductItemProps = {
  item: IProduct;
};

export const NewReceipt = () => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  //@ts-ignore
  global.startTime = new Date().getTime();

  const products = getProducts({realm});

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const [price, setPrice] = useState<number | undefined>();
  const [receipt, setReceipt] = useState<IReceiptItem[]>([]);
  const [quantity, setQuantity] = useState<string | undefined>(
    FormDefaults.get('quantity', ''),
  );
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isProductsPreviewModalOpen, setIsProductsPreviewModalOpen] = useState(
    false,
  );
  const authService = getAuthService();
  const currency = authService.getUserCurrency();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);
  const handlePriceChange = useCallback((item) => {
    setPrice(item);
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleSelectProduct = useCallback((item: IProduct) => {
    setSelectedProduct(item);
    setPrice(item?.price);
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
    setReceipt([]);
    handleCloseSummaryModal();
  }, [handleCloseSummaryModal]);

  const handleAddItem = useCallback(() => {
    if (price && quantity) {
      const product = {
        ...selectedProduct,
        _id: selectedProduct?._id,
        price,
        product: selectedProduct,
        name: selectedProduct?.name,
        quantity: parseFloat(quantity),
      } as IReceiptItem;
      if (
        receipt
          .map((item) => item._id?.toString())
          .includes(product?._id?.toString())
      ) {
        setReceipt(
          receipt.map((item) => {
            if (item._id?.toString() === product._id?.toString()) {
              return {
                ...item,
                quantity: item.quantity + parseFloat(quantity),
              };
            }
            return item;
          }),
        );
      } else {
        setReceipt([product, ...receipt]);
      }
      setSelectedProduct(null);
      setPrice(undefined);
      setQuantity('');
    }
  }, [price, quantity, receipt, selectedProduct]);

  const handleUpdateProductItem = useCallback(
    (item: IReceiptItem) => {
      setReceipt(
        receipt.map((receiptItem) => {
          if (receiptItem._id?.toString() === item._id?.toString()) {
            return item;
          }
          return receiptItem;
        }),
      );
    },
    [receipt],
  );

  const handleRemoveProductItem = useCallback(
    (item: IReceiptItem) => {
      setReceipt(
        receipt.filter(
          (receiptItem) => receiptItem._id?.toString() !== item._id?.toString(),
        ),
      );
    },
    [receipt],
  );

  const handleDone = useCallback(() => {
    let items = receipt;
    if (selectedProduct && quantity && price) {
      const product = {
        ...selectedProduct,
        _id: selectedProduct._id,
        price,
        product: selectedProduct,
        name: selectedProduct.name,
        quantity: parseFloat(quantity),
      } as IReceiptItem;

      handleAddItem();

      if (
        receipt
          .map((item) => item._id?.toString())
          .includes(product?._id?.toString())
      ) {
        items = receipt.map((item) => {
          if (item._id?.toString() === product._id?.toString()) {
            return {
              ...item,
              quantity: item.quantity + parseFloat(quantity),
            };
          }
          return item;
        });
      } else {
        items = [product, ...receipt];
      }
    }
    if ((selectedProduct && quantity && price) || items.length) {
      setReceipt(items);
      setSelectedProduct(null);
      handleOpenSummaryModal();
    } else {
      Alert.alert('Info', 'Please select at least one product item');
    }
  }, [
    price,
    receipt,
    quantity,
    handleAddItem,
    selectedProduct,
    handleOpenSummaryModal,
  ]);

  const handleProductSearch = useCallback((item: IProduct, text: string) => {
    return (
      `${item.sku} - ${item.name}`.toLowerCase().indexOf(text.toLowerCase()) >
      -1
    );
  }, []);

  const renderSearchDropdownItem = useCallback(({item, onPress}) => {
    return (
      <Touchable onPress={() => onPress(item)}>
        <View style={styles.recentProductItem}>
          <Text style={applyStyles(styles.recentProductItemText, 'text-400')}>
            {item.sku} - {item.name} {item.weight ? `(${item.weight}))` : ''}
          </Text>
        </View>
      </Touchable>
    );
  }, []);

  const renderRecentProducts = useCallback(
    ({item: product}: RecentProductItemProps) => {
      return (
        <Touchable onPress={() => handleSelectProduct(product)}>
          <View style={styles.recentProductItem}>
            <Text style={applyStyles(styles.recentProductItemText, 'text-400')}>
              {product.sku ? `${product.sku} - ` : ''}
              {product.name} {product.weight ? `(${product.weight}))` : ''}
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
    const p = price ? price : 0;
    const q = quantity ? parseFloat(quantity) : 0;
    const total = p * q;
    return numberWithCommas(total);
  }, [price, quantity]);

  return (
    <SafeAreaView style={styles.container}>
      <SearchableDropdown
        items={products}
        setSort={handleProductSearch}
        onItemSelect={handleSelectProduct}
        renderItem={renderSearchDropdownItem}
        noResultsActionButtonText="Add a product"
        textInputProps={{placeholder: 'Search Products'}}
        noResultsAction={() => navigation.navigate('AddProduct')}
      />
      <Touchable onPress={() => navigation.navigate('AddProduct')}>
        <View
          style={applyStyles('flex-row px-lg py-lg items-center', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Icon
            size={24}
            name="plus"
            type="feathericons"
            color={colors.primary}
          />
          <Text
            style={applyStyles('text-400 pl-md', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            Add Product
          </Text>
        </View>
      </Touchable>
      <FlatList
        data={products}
        style={styles.recentProductsList}
        renderItem={renderRecentProducts}
        ListHeaderComponent={renderRecentProductsHeader}
        keyExtractor={(item, index) => `${item._id}-${index}`}
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
        onBackdropPress={handleCloseProductModal}
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
                You have{' '}
                <Text style={styles.receiptItemsCount}>{receipt?.length}</Text>{' '}
                Products in your receipt
              </Text>
              {!!receipt.length && (
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
                  style={applyStyles('flex-row', 'items-center', {
                    width: '48%',
                  })}>
                  <CurrencyInput
                    label="Unit Price"
                    value={price?.toString()}
                    onChange={(text) => handlePriceChange(text)}
                  />
                </View>
                <View
                  style={applyStyles('text-400', {
                    width: '48%',
                  })}>
                  <FloatingLabelInput
                    value={quantity}
                    label="Quantity"
                    keyboardType="numeric"
                    onChangeText={handleQuantityChange}
                  />
                </View>
              </View>
              <View style={styles.calculatorSectionInputs}>
                <FloatingLabelInput
                  label="Subtotal"
                  editable={false}
                  inputStyle={applyStyles({paddingLeft: 32})}
                  value={getSubtotal()}
                  leftIcon={
                    <Text style={applyStyles(styles.inputIconText, 'text-400')}>
                      {currency}
                    </Text>
                  }
                />
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

      <ReactNativeModal visible={isSummaryModalOpen}>
        <ReceiptSummary
          products={receipt}
          onClearReceipt={handleClearReceipt}
          onRemoveProductItem={handleRemoveProductItem}
          onUpdateProductItem={handleUpdateProductItem}
          onCloseSummaryModal={handleCloseSummaryModal}
        />
      </ReactNativeModal>

      <View style={styles.calculatorSection}>
        {!selectedProduct && (
          <Text style={applyStyles(styles.receiptItemsCountText, 'text-400')}>
            You have{' '}
            <Text style={styles.receiptItemsCount}>{receipt?.length}</Text>{' '}
            Products in your receipt
          </Text>
        )}
        {!!receipt.length && (
          <Button
            title="Done"
            variantColor="red"
            onPress={handleDone}
            style={applyStyles('my-sm', 'w-full')}
          />
        )}
      </View>
      <ProductsPreviewModal
        products={receipt}
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
