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
import {showToast} from '@/helpers/utils';
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
  View,
} from 'react-native';

type Props = {
  receipt?: IReceipt;
};

type NewProduct = IProduct & {id?: number};

export const CreateProductScreen = (props: Props) => {
  const {receipt} = props;

  const realm = useRealm();
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState<number | undefined>();
  const [products, setProducts] = useState<NewProduct[]>([]);
  const [showContinueBtn, setShowContinueBtn] = useState(true);
  const [itemToEdit, setItemToEdit] = useState<NewProduct | null>(null);
  const [quantity, setQuantity] = useState<string | undefined>(
    FormDefaults.get('quantity', ''),
  );

  useEffect(() => {
    getAnalyticsService().logEvent('productStart').catch(handleError);
  }, [handleError, receipt]);

  const handleClearState = useCallback(() => {
    setName('');
    setPrice(0);
    setQuantity('');
    setItemToEdit(null);
    Keyboard.dismiss();
  }, []);

  const handleGoBack = useCallback(() => {
    handleClearState();
    navigation.goBack();
  }, [navigation, handleClearState]);

  const handleNameChange = useCallback((text) => {
    setName(text);
  }, []);

  const handlePriceChange = useCallback((item) => {
    setPrice(item);
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleStartEdit = useCallback((item: NewProduct) => {
    setItemToEdit(item);
    setName(item.name);
    setPrice(item.price);
    if (item && item?.quantity && item?.quantity > 0) {
      setQuantity(item?.quantity?.toString());
    } else {
      setQuantity('0');
    }
  }, []);

  const handleAddProducts = useCallback(
    (payload: NewProduct[]) => {
      setIsLoading(true);
      setTimeout(() => {
        saveProducts({
          realm,
          products: payload.map((item) => {
            delete item.id;
            return item;
          }),
        });
      }, 100);
      setIsLoading(false);
      navigation.navigate('ProductsTab');
    },
    [navigation, realm],
  );

  const handleUpdateProduct = useCallback(() => {
    setProducts(
      products.map((product) => {
        if (price && quantity && itemToEdit && product.id === itemToEdit?.id) {
          return {...itemToEdit, name, price, quantity: parseFloat(quantity)};
        }
        return product;
      }),
    );
    handleClearState();
  }, [itemToEdit, price, products, name, quantity, handleClearState]);

  const handleRemoveProduct = useCallback(() => {
    setProducts(products.filter((product) => product?.id !== itemToEdit?.id));
    handleClearState();
  }, [products, itemToEdit, handleClearState]);

  const handleAddProduct = useCallback(() => {
    const priceCondition = price || price === 0 ? true : false;
    const quantityCondition =
      quantity && parseFloat(quantity) >= 0 ? true : false;
    if (name && priceCondition && quantityCondition && quantity) {
      const product = {
        name,
        price,
        id: Date.now(),
        quantity: parseFloat(quantity),
      } as NewProduct;

      setProducts([product, ...products]);

      Keyboard.dismiss();
      handleClearState();
      showToast({message: 'PRODUCT/SERVICE SUCCESSFULLY ADDED'});
    } else {
      Alert.alert('Info', 'Please add product/service name, price & quantity');
    }
  }, [price, quantity, name, products, handleClearState]);

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
      handleClearState();

      showToast({message: 'PRODUCT/SERVICE SUCCESSFULLY ADDED'});

      handleAddProducts([product, ...products]);
    } else if (items.length) {
      handleAddProducts(products);
    } else {
      Alert.alert(
        'Info',
        'Please add at least one product/service with quantity',
      );
    }
  }, [
    products,
    price,
    quantity,
    name,
    handleError,
    handleClearState,
    handleAddProducts,
  ]);

  const renderReceiptItem = useCallback(
    ({item}: ReceiptTableItemProps) => (
      <ReceiptTableItem
        type="product"
        item={item}
        onPress={() => {
          handleStartEdit(item);
        }}
      />
    ),
    [handleStartEdit],
  );

  const _keyboardDidShow = () => {
    setShowContinueBtn(false);
  };

  const _keyboardDidHide = () => {
    setShowContinueBtn(true);
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        title="create product"
        iconRight={{iconName: 'x', onPress: handleGoBack}}
      />
      <View style={applyStyles('flex-1')}>
        <FlatList
          data={[]}
          nestedScrollEnabled
          persistentScrollbar
          renderItem={undefined}
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={
            <>
              <View style={applyStyles('bg-gray-10 px-16 py-32')}>
                <View style={applyStyles('pb-16')}>
                  <AppInput
                    value={name}
                    style={applyStyles('bg-white')}
                    label="Product / service name"
                    onChangeText={handleNameChange}
                    placeholder="Enter product/service name here"
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
                      'flex-row items-center justify-between',
                    )}>
                    <Button
                      title="Delete"
                      variantColor="transparent"
                      onPress={handleRemoveProduct}
                      style={applyStyles({
                        width: '48%',
                      })}
                    />
                    <Button
                      title="Save"
                      variantColor="red"
                      onPress={handleUpdateProduct}
                      style={applyStyles({
                        width: '48%',
                      })}
                    />
                  </View>
                ) : (
                  <Button
                    variantColor="clear"
                    title="Add New Product/Service"
                    onPress={handleAddProduct}
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
                data={products}
                persistentScrollbar
                style={applyStyles('bg-white')}
                renderItem={renderReceiptItem}
                keyboardShouldPersistTaps="always"
                ListHeaderComponent={
                  products.length ? (
                    <ReceiptTableHeader type="product" />
                  ) : undefined
                }
                keyExtractor={(item, index) =>
                  `${item?.name?.toString()}-${index}`
                }
                ListEmptyComponent={
                  <View style={applyStyles('py-96 center mx-auto')}>
                    <Text
                      style={applyStyles(
                        'px-48 text-700 text-center text-gray-200 text-uppercase',
                      )}>
                      There are no products/services to add
                    </Text>
                  </View>
                }
              />
            </>
          }
        />

        {showContinueBtn && (
          <StickyFooter>
            <Button
              title="Finish"
              onPress={handleDone}
              isLoading={isLoading}
              disabled={!products.length}
            />
          </StickyFooter>
        )}
      </View>
    </SafeAreaView>
  );
};
