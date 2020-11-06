import {
  AppInput,
  Button,
  CurrencyInput,
  Header,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
  StickyFooter,
} from '@/components';
import {IProduct} from '@/models/Product';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useAppNavigation} from '@/services/navigation';
import {saveProducts} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {applyStyles} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  SafeAreaView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {EditProductModal} from './EditProductModal';

type Props = {
  receipt?: IReceipt;
};

export const CreateProductScreen = (props: Props) => {
  const {receipt} = props;

  const realm = useRealm();
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<number | undefined>();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [itemToEdit, setItemToEdit] = useState<IProduct | null>(null);
  const [quantity, setQuantity] = useState<string | undefined>(
    FormDefaults.get('quantity', ''),
  );

  useEffect(() => {
    getAnalyticsService().logEvent('productStart').catch(handleError);
  }, [handleError, receipt]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNameChange = useCallback((text) => {
    setName(text);
  }, []);

  const handlePriceChange = useCallback((item) => {
    setPrice(item);
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleOpenEditReceiptItemModal = useCallback(
    (item: IProduct) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          item_id: String(item._id),
          content_type: 'Product',
        })
        .catch(handleError);
      setItemToEdit(item);
    },
    [handleError],
  );

  const handleCloseEditReceiptItemModal = useCallback(() => {
    setItemToEdit(null);
  }, []);

  const handleAddProducts = useCallback(
    (payload: IProduct[]) => {
      setIsLoading(true);
      setTimeout(() => {
        saveProducts({realm, products: payload});
      }, 100);
      setIsLoading(false);
      navigation.navigate('ProductsTab');
    },
    [navigation, realm],
  );

  const handleUpdateProduct = useCallback(
    (item: IProduct) => {
      setProducts(
        products.map((product) => {
          if (product._id?.toString() === item._id?.toString()) {
            return item;
          }
          return product;
        }),
      );
    },
    [products],
  );

  const handleRemoveProduct = useCallback(
    (item: IProduct) => {
      setProducts(
        products.filter(
          (product) => product._id?.toString() !== item._id?.toString(),
        ),
      );
    },
    [products],
  );

  const handleAddProduct = useCallback(() => {
    const priceCondition = price || price === 0 ? true : false;
    const quantityCondition = quantity ? !!parseFloat(quantity) : false;
    if (name && priceCondition && quantityCondition && quantity) {
      const product = {
        name,
        price,
        quantity: parseFloat(quantity),
      } as IProduct;

      getAnalyticsService().logEvent('productAdded').catch(handleError);

      if (
        products
          .map((item) => item._id?.toString())
          .includes(product?._id?.toString())
      ) {
        setProducts(
          products.map((item) => {
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
        setProducts([product, ...products]);
      }

      Keyboard.dismiss();
      setPrice(0);
      setQuantity('');
      ToastAndroid.show('ITEM SUCCESSFULLY ADDED', ToastAndroid.LONG);
    } else {
      Alert.alert('Info', 'Please add product name & quantity');
    }
  }, [price, quantity, name, handleError, products]);

  const handleDone = useCallback(() => {
    let items = products;
    const priceCondition = price || price === 0 ? true : false;
    const quantityCondition = quantity ? !!parseFloat(quantity) : false;

    if (quantity && quantityCondition && priceCondition) {
      const product = {
        name,
        price,
        quantity: parseFloat(quantity),
      } as IProduct;

      getAnalyticsService().logEvent('productAdded').catch(handleError);

      setProducts([product, ...products]);

      Keyboard.dismiss();
      setPrice(0);
      setQuantity('');

      ToastAndroid.show('ITEM SUCCESSFULLY ADDED', ToastAndroid.LONG);

      handleAddProducts([product, ...products]);
    } else if (items.length) {
      handleAddProducts(products);
    } else {
      Alert.alert('Info', 'Please add at least one product item with quantity');
    }
  }, [products, price, quantity, name, handleError, handleAddProducts]);

  const renderReceiptItem = useCallback(
    ({item}: ReceiptTableItemProps) => (
      <ReceiptTableItem
        item={item}
        onPress={() => {
          handleOpenEditReceiptItemModal(item);
        }}
      />
    ),
    [handleOpenEditReceiptItemModal],
  );

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        title="create product"
        iconRight={{iconName: 'x', onPress: handleGoBack}}
      />
      <View style={applyStyles('flex-1')}>
        <View style={applyStyles('bg-gray-10 px-16 py-32')}>
          <View style={applyStyles('pb-16')}>
            <AppInput
              value={name}
              editable={false}
              label="Product / service name"
              onChangeText={handleNameChange}
              placeholder="Enter product / service name here"
            />
          </View>
          <View
            style={applyStyles('pb-16 flex-row items-center justify-between')}>
            <View style={applyStyles({width: '48%'})}>
              <CurrencyInput
                placeholder="0.00"
                label="Unit Price"
                value={price?.toString()}
                style={applyStyles('bg-white', {
                  borderWidth: 0,
                })}
                onChange={(text) => handlePriceChange(text)}
              />
            </View>
            <View style={applyStyles({width: '48%'})}>
              <AppInput
                placeholder="0"
                value={quantity}
                label="Quantity"
                keyboardType="numeric"
                style={applyStyles('bg-white', {
                  borderWidth: 0,
                })}
                onChangeText={handleQuantityChange}
              />
            </View>
          </View>
          <Button
            variantColor="clear"
            title="Add New Product"
            onPress={handleAddProduct}
          />
        </View>
        <FlatList
          data={products}
          persistentScrollbar
          style={applyStyles('bg-white')}
          renderItem={renderReceiptItem}
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={
            products.length ? <ReceiptTableHeader /> : undefined
          }
          keyExtractor={(item) => `${item?._id?.toString()}`}
          ListEmptyComponent={
            <View style={applyStyles('py-96 center mx-auto')}>
              <Text
                style={applyStyles(
                  'text-700 text-center text-gray-200 text-uppercase',
                )}>
                There are no items to add
              </Text>
            </View>
          }
        />
        <StickyFooter>
          <Button title="Continue" isLoading={isLoading} onPress={handleDone} />
        </StickyFooter>
        <EditProductModal
          item={itemToEdit}
          visible={!!itemToEdit}
          onClose={handleCloseEditReceiptItemModal}
          onRemoveProductItem={handleRemoveProduct}
          onUpdateProductItem={handleUpdateProduct}
        />
      </View>
    </SafeAreaView>
  );
};
