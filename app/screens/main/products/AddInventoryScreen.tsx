import {
  AppInput,
  AutoComplete,
  Button,
  CurrencyInput,
  Header,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
  StickyFooter,
} from '@/components';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useAppNavigation} from '@/services/navigation';
import {getProducts, saveProduct} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {applyStyles} from '@/styles';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  SafeAreaView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useReceiptProvider} from '../receipts/ReceiptProvider';

export const AddInventoryScreen = () => {
  const realm = useRealm();
  const handleError = useErrorHandler();
  const products = getProducts({realm});
  const navigation = useAppNavigation();
  const {handleUpdateInventoryStock} = useReceiptProvider();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [price, setPrice] = useState<number | undefined>();
  const [itemToEdit, setItemToEdit] = useState<IProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [inventoryStock, setInventoryStock] = useState<IProduct[]>([]);
  const [quantity, setQuantity] = useState<string | undefined>(
    FormDefaults.get('quantity', ''),
  );

  const handleClearState = useCallback(() => {
    setPrice(0);
    setQuantity('');
    setSearchQuery('');
    setItemToEdit(null);
    setSelectedProduct(null);
    Keyboard.dismiss();
  }, []);

  const handleGoBack = useCallback(() => {
    handleClearState();
    navigation.goBack();
  }, [navigation, handleClearState]);

  const handlePriceChange = useCallback((item) => {
    setPrice(item);
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleProductSearch = useCallback((item: IProduct, text: string) => {
    return `${item.name}`.toLowerCase().indexOf(text.toLowerCase()) > -1;
  }, []);

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setSearchQuery(searchValue);
  }, []);

  const handleStartEdit = useCallback((item: IProduct) => {
    setItemToEdit(item);
    setSearchQuery(item.name);
    setPrice(item.price);
    setQuantity(item?.quantity?.toString());
  }, []);

  const handleSelectProduct = useCallback(
    (item: IProduct) => {
      setSearchQuery(item.name);
      const addedItem = inventoryStock.find(
        (inventoryStockItem) =>
          inventoryStockItem?._id?.toString() === item?._id?.toString(),
      );
      if (addedItem) {
        setQuantity(addedItem?.quantity?.toString());
      }
      setSelectedProduct(item);
      item.price === null ? setPrice(0) : setPrice(item?.price);
    },
    [inventoryStock],
  );

  const handleUpdateInventoryStockItem = useCallback(() => {
    setInventoryStock(
      inventoryStock.map((inventoryStockItem) => {
        if (
          price &&
          quantity &&
          itemToEdit &&
          inventoryStockItem._id?.toString() === itemToEdit?._id?.toString()
        ) {
          return {...itemToEdit, price, quantity: parseFloat(quantity)};
        }
        return inventoryStockItem;
      }),
    );
    handleClearState();
  }, [price, quantity, itemToEdit, handleClearState, inventoryStock]);

  const handleRemoveInventoryStockItem = useCallback(() => {
    setInventoryStock(
      inventoryStock.filter(
        (inventoryStockItem) =>
          inventoryStockItem._id?.toString() !== itemToEdit?._id?.toString(),
      ),
    );
    handleClearState();
  }, [itemToEdit, inventoryStock, handleClearState]);

  const handleAddProduct = useCallback(
    ({name, price: productPrice}) => {
      getAnalyticsService().logEvent('productStart').catch(handleError);
      const createdProduct = saveProduct({
        realm,
        product: {name, price: productPrice},
      });
      getAnalyticsService().logEvent('productAdded').catch(handleError);
      setIsNewProduct(false);
      return createdProduct;
    },
    [handleError, realm],
  );

  const handleAddReceiptItem = useCallback(() => {
    let payload = selectedProduct;
    const priceCondition = price || price === 0 ? true : false;
    const quantityCondition = quantity ? !!parseFloat(quantity) : false;
    if (priceCondition && quantityCondition && quantity) {
      if (isNewProduct) {
        payload = handleAddProduct({name: searchQuery, price});
      }

      const product = {
        ...payload,
        price,
        product: payload,
        _id: payload?._id,
        name: payload?.name,
        quantity: parseFloat(quantity),
      } as IReceiptItem;

      getAnalyticsService()
        .logEvent('productAddedToReceipt')
        .catch(handleError);

      if (
        inventoryStock
          .map((item) => item._id?.toString())
          .includes(product?._id?.toString())
      ) {
        setInventoryStock(
          inventoryStock.map((item) => {
            if (item._id?.toString() === product._id?.toString()) {
              return {
                ...item,
                quantity: parseFloat(quantity),
              };
            }
            return item;
          }),
        );
      } else {
        setInventoryStock([product, ...inventoryStock]);
      }

      Keyboard.dismiss();
      handleClearState();
      ToastAndroid.show(
        'PRODUCT/SERVICE SUCCESSFULLY ADDED',
        ToastAndroid.LONG,
      );
    } else {
      Alert.alert('Info', 'Please add product/service quantity');
    }
  }, [
    selectedProduct,
    price,
    quantity,
    isNewProduct,
    handleError,
    inventoryStock,
    handleClearState,
    handleAddProduct,
    searchQuery,
  ]);

  const handleDone = useCallback(() => {
    let items = inventoryStock;
    let payload = selectedProduct;
    const priceCondition = price || price === 0 ? true : false;
    const quantityCondition = quantity ? !!parseFloat(quantity) : false;

    if (isNewProduct) {
      payload = handleAddProduct({
        name: searchQuery,
        price,
      });
    }

    if (payload && quantity && quantityCondition && priceCondition) {
      const product = {
        ...payload,
        price,
        product: payload,
        _id: payload?._id,
        name: payload?.name,
        quantity: parseFloat(quantity),
      } as IReceiptItem;

      setInventoryStock([product, ...inventoryStock]);

      Keyboard.dismiss();
      handleClearState();

      ToastAndroid.show(
        'PRODUCT/SERVICE SUCCESSFULLY ADDED',
        ToastAndroid.LONG,
      );

      handleUpdateInventoryStock([product, ...inventoryStock]);

      navigation.navigate('InventoryOtherDetails');
    } else if (items.length) {
      handleClearState();
      handleUpdateInventoryStock(products);
      navigation.navigate('InventoryOtherDetails');
    } else {
      Alert.alert(
        'Info',
        'Please select at least one product/service with quantity',
      );
    }
  }, [
    inventoryStock,
    selectedProduct,
    price,
    quantity,
    isNewProduct,
    handleAddProduct,
    searchQuery,
    handleClearState,
    handleUpdateInventoryStock,
    navigation,
    products,
  ]);

  const renderInventoryStockItem = useCallback(
    ({item}: ReceiptTableItemProps) => (
      <ReceiptTableItem
        item={item}
        onPress={() => {
          //@ts-ignore
          handleStartEdit(item);
        }}
      />
    ),
    [handleStartEdit],
  );

  const renderSearchDropdownItem = useCallback(({item, onPress}) => {
    return (
      <Touchable onPress={() => onPress(item)}>
        <View style={applyStyles('p-16 flex-row items-center justify-between')}>
          <Text style={applyStyles('text-700 text-base text-gray-300')}>
            {item.name}
          </Text>
          <Text style={applyStyles('text-400 text-base text-gray-300')}>
            {amountWithCurrency(item.price)}
          </Text>
        </View>
      </Touchable>
    );
  }, []);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        title="add inventory"
        iconRight={{iconName: 'x', onPress: handleGoBack}}
      />
      <View style={applyStyles('flex-1')}>
        <FlatList
          data={[]}
          renderItem={undefined}
          persistentScrollbar
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={
            <>
              <View style={applyStyles('bg-gray-10 px-16 py-32')}>
                <View style={applyStyles('pb-16')}>
                  <AutoComplete<IProduct>
                    rightIcon="box"
                    items={products}
                    value={searchQuery}
                    label="Product / Service"
                    setFilter={handleProductSearch}
                    onItemSelect={handleSelectProduct}
                    renderItem={renderSearchDropdownItem}
                    onChangeText={handleChangeSearchQuery}
                    noResultsAction={() => setIsNewProduct(true)}
                    textInputProps={{
                      placeholder: 'Search or enter product/service here',
                    }}
                  />
                </View>
                <View
                  style={applyStyles(
                    'pb-16 flex-row items-center justify-between',
                  )}>
                  <View style={applyStyles({width: '48%'})}>
                    <CurrencyInput
                      placeholder="0.00"
                      label="Unit Price"
                      value={price?.toString()}
                      style={applyStyles('bg-white')}
                      onChange={(text) => handlePriceChange(text)}
                    />
                  </View>
                  <View style={applyStyles({width: '48%'})}>
                    <AppInput
                      placeholder="0"
                      value={quantity}
                      label="Quantity"
                      keyboardType="numeric"
                      style={applyStyles('bg-white')}
                      onChangeText={handleQuantityChange}
                    />
                  </View>
                </View>
                {itemToEdit ? (
                  <View
                    style={applyStyles(
                      'flex-row items-center py-12 justify-between',
                    )}>
                    <Button
                      title="Delete"
                      variantColor="transparent"
                      onPress={handleRemoveInventoryStockItem}
                      style={applyStyles({
                        width: '48%',
                      })}
                    />
                    <Button
                      title="Save"
                      variantColor="red"
                      onPress={handleUpdateInventoryStockItem}
                      style={applyStyles({
                        width: '48%',
                      })}
                    />
                  </View>
                ) : (
                  <Button
                    variantColor="clear"
                    title="Add Inventory"
                    onPress={handleAddReceiptItem}
                    style={applyStyles({
                      shadowColor: 'red',
                      shadowOffset: {
                        width: 0,
                        height: 4,
                      },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 8,
                    })}
                  />
                )}
              </View>
              <FlatList
                persistentScrollbar
                data={inventoryStock}
                style={applyStyles('bg-white')}
                renderItem={renderInventoryStockItem}
                keyboardShouldPersistTaps="always"
                ListHeaderComponent={
                  inventoryStock.length ? <ReceiptTableHeader /> : undefined
                }
                keyExtractor={(item) => `${item?._id?.toString()}`}
                ListEmptyComponent={
                  <View style={applyStyles('py-96 center mx-auto')}>
                    <Text
                      style={applyStyles(
                        'px-48 text-700 text-center text-gray-200 text-uppercase',
                      )}>
                      There are no products/service to add
                    </Text>
                  </View>
                }
              />
            </>
          }
        />
        <StickyFooter>
          <Button
            title="Continue"
            onPress={handleDone}
            disabled={!products.length}
          />
        </StickyFooter>
      </View>
    </SafeAreaView>
  );
};
