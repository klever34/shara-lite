import {
  AppInput,
  Button,
  CurrencyInput,
  Header,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
  StickyFooter,
  toNumber,
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
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  Keyboard,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {ToastContext} from '@/components/Toast';

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
    getAnalyticsService().logEvent('productStart', {}).catch(handleError);
  }, [handleError, receipt]);

  const {showSuccessToast} = useContext(ToastContext);

  const handleClearState = useCallback(() => {
    setName('');
    setQuantity('');
    setPrice(undefined);
    setItemToEdit(null);
    Keyboard.dismiss();
  }, []);

  const handleNameChange = useCallback((text) => {
    setName(text);
  }, []);

  const handlePriceChange = useCallback((item) => {
    setPrice(toNumber(item));
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
      saveProducts({
        realm,
        products: payload.map((item) => {
          delete item.id;
          return item;
        }),
      });
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('ProductsTab');
      }, 50 * payload.length);
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
    const priceCondition = !!(price || price === 0);
    if (name && priceCondition) {
      const product = {
        name,
        price,
        id: Date.now(),
        quantity: parseFloat(quantity ?? '0') || 0,
      } as NewProduct;

      setProducts([product, ...products]);

      Keyboard.dismiss();
      handleClearState();
      showSuccessToast('PRODUCT/SERVICE SUCCESSFULLY ADDED');
    } else {
      Alert.alert('Info', 'Please add product/service name and price');
    }
  }, [price, quantity, name, products, handleClearState, showSuccessToast]);

  const handleDone = useCallback(() => {
    let items = products;
    const priceCondition = !!(price || price === 0);

    if (name && priceCondition) {
      const product = {
        name,
        price,
        quantity: parseFloat(quantity ?? '0') || 0,
      } as IProduct;

      getAnalyticsService().logEvent('productAdded', {}).catch(handleError);

      setProducts([product, ...products]);

      Keyboard.dismiss();
      handleClearState();

      showSuccessToast('PRODUCT/SERVICE SUCCESSFULLY ADDED');

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
    showSuccessToast,
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

    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  const unitPriceFieldRef = useRef<TextInput | null>(null);
  const quantityFieldRef = useRef<TextInput | null>(null);

  const handleGoBack = useCallback(() => {
    const goBack = () => {
      handleClearState();
      navigation.goBack();
    };
    if (products.length) {
      Alert.alert(
        'Warning',
        'Are you sure you want to exit this page? The product has not been added.',
        [
          {
            text: 'No',
            onPress: () => {},
          },
          {
            text: 'Yes',
            onPress: goBack,
          },
        ],
      );
    } else {
      goBack();
    }
  }, [handleClearState, navigation, products.length]);

  const handleBackButtonPress = useCallback(() => {
    if (!navigation.isFocused()) {
      return false;
    }
    if (products.length) {
      handleGoBack();
      return true;
    }
    return false;
  }, [navigation, products.length, handleGoBack]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonPress,
      );
    };
  }, [handleBackButtonPress]);

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <Header
        title="create product"
        headerRight={{options: [{icon: 'x', onPress: handleGoBack}]}}
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
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      setImmediate(() => {
                        if (unitPriceFieldRef.current) {
                          unitPriceFieldRef.current.focus();
                        }
                      });
                    }}
                  />
                </View>
                <View
                  style={applyStyles(
                    'pb-16 flex-row items-center justify-between',
                  )}>
                  <View style={applyStyles({width: '48%'})}>
                    <CurrencyInput
                      ref={unitPriceFieldRef}
                      placeholder="0.00"
                      label="Unit Price"
                      value={price}
                      style={applyStyles('bg-white')}
                      onChangeText={handlePriceChange}
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        setImmediate(() => {
                          if (quantityFieldRef.current) {
                            quantityFieldRef.current.focus();
                          }
                        });
                      }}
                    />
                  </View>
                  <View style={applyStyles({width: '48%'})}>
                    <AppInput
                      ref={quantityFieldRef}
                      placeholder="0"
                      value={quantity}
                      label="Quantity"
                      keyboardType="numeric"
                      style={applyStyles('bg-white')}
                      onChangeText={handleQuantityChange}
                      onSubmitEditing={
                        itemToEdit ? handleUpdateProduct : handleAddProduct
                      }
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
