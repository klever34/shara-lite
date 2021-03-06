import {
  AppInput,
  AutoComplete,
  Button,
  CurrencyInput,
  Header,
  ReceiptTableFooterItem,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
  StickyFooter,
  toNumber,
} from '@/components';
import {ToastContext} from '@/components/Toast';
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
import {applyStyles, colors} from '@/styles';
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
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {EditReceiptItemModal} from './EditReceiptItemModal';
import {useReceiptProvider} from './ReceiptProvider';

export const CreateReceiptScreen = ({route}: any) => {
  const receipt = route.params.receipt;

  const realm = useRealm();
  const handleError = useErrorHandler();
  const products = getProducts({realm});
  const navigation = useAppNavigation();
  const {handleUpdateReceipt} = useReceiptProvider();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [price, setPrice] = useState<number | undefined>();
  const [showContinueBtn, setShowContinueBtn] = useState(true);
  const [itemToEdit, setItemToEdit] = useState<IReceiptItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [totalAmount, setTotalAmount] = useState(receipt?.total_amount || 0);
  const [receiptItems, setReceiptItems] = useState<IReceiptItem[]>(
    receipt?.items || [],
  );
  const [quantity, setQuantity] = useState<string | undefined>(
    FormDefaults.get('quantity', ''),
  );

  const handleClearState = useCallback(() => {
    setPrice(undefined);
    setQuantity('');
    setSearchQuery('');
    setItemToEdit(null);
    setSelectedProduct(null);
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    getAnalyticsService().logEvent('receiptStart', {}).catch(handleError);
  }, [handleError, receipt]);

  const handlePriceChange = useCallback((item) => {
    setPrice(toNumber(item));
  }, []);

  const handleQuantityChange = useCallback((item) => {
    setQuantity(item);
  }, []);

  const handleProductSearch = useCallback((item: IProduct, text: string) => {
    return `${item.name}`.toLowerCase().indexOf(text.toLowerCase()) > -1;
  }, []);

  const handleOpenEditReceiptItemModal = useCallback(
    (item: IReceiptItem) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          item_id: String(item._id),
          content_type: 'ReceiptItem',
        })
        .catch(handleError);
      setItemToEdit(item);
    },
    [handleError],
  );

  const handleCloseEditReceiptItemModal = useCallback(() => {
    setItemToEdit(null);
  }, []);

  const handleSelectProduct = useCallback(
    (item: IProduct) => {
      setSearchQuery(item.name);
      const addedItem = receiptItems.find(
        (receiptItem) =>
          receiptItem?.product &&
          receiptItem?.product?._id?.toString() === item?._id?.toString(),
      );
      if (addedItem) {
        setQuantity(addedItem.quantity.toString());
      }
      setSelectedProduct(item);
      item.price === null ? setPrice(undefined) : setPrice(item?.price);
    },
    [receiptItems],
  );

  const handleUpdateReceiptItem = useCallback(
    (item: IReceiptItem) => {
      setReceiptItems(
        receiptItems.map((receiptItem) => {
          if (
            receiptItem.product._id?.toString() === item.product._id?.toString()
          ) {
            return item;
          }
          return receiptItem;
        }),
      );
    },
    [receiptItems],
  );

  const handleRemoveReceiptItem = useCallback(
    (item: IReceiptItem) => {
      setReceiptItems(
        receiptItems.filter(
          (receiptItem) =>
            receiptItem.product._id?.toString() !==
            item.product._id?.toString(),
        ),
      );
    },
    [receiptItems],
  );

  const handleAddProduct = useCallback(
    ({name, price: productPrice}) => {
      getAnalyticsService().logEvent('productStart', {}).catch(handleError);
      const createdProduct = saveProduct({
        realm,
        product: {name, price: productPrice},
      });
      getAnalyticsService().logEvent('productAdded', {}).catch(handleError);
      setIsNewProduct(false);
      return createdProduct;
    },
    [handleError, realm],
  );
  const {showSuccessToast} = useContext(ToastContext);

  const handleAddReceiptItem = useCallback(() => {
    let payload = selectedProduct;
    const priceCondition = !!(price || price === 0);
    const quantityCondition = quantity ? !!parseFloat(quantity) : false;
    if (isNewProduct) {
      payload = handleAddProduct({name: searchQuery, price});
    }
    if (payload && priceCondition && quantityCondition && quantity) {
      const product = {
        ...payload,
        price,
        product: payload,
        _id: payload?._id,
        name: payload?.name,
        quantity: parseFloat(quantity),
      } as IReceiptItem;

      getAnalyticsService()
        .logEvent('productAddedToReceipt', {})
        .catch(handleError);

      if (
        receiptItems
          .map((item) => item._id?.toString())
          .includes(product?._id?.toString())
      ) {
        setReceiptItems(
          receiptItems.map((item) => {
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
        setReceiptItems([product, ...receiptItems]);
      }

      Keyboard.dismiss();
      setQuantity('');
      setSearchQuery('');
      setPrice(undefined);
      setSelectedProduct(null);
      showSuccessToast('PRODUCT/SERVICE SUCCESSFULLY ADDED');
    } else {
      Alert.alert('Info', 'Please add product/service, quantity & price');
    }
  }, [
    selectedProduct,
    price,
    quantity,
    isNewProduct,
    handleAddProduct,
    searchQuery,
    handleError,
    receiptItems,
    showSuccessToast,
  ]);

  const handleDone = useCallback(() => {
    let items = receiptItems;
    let payload = selectedProduct;
    const priceCondition = !!(price || price === 0);
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

      getAnalyticsService()
        .logEvent('productAddedToReceipt', {})
        .catch(handleError);

      setReceiptItems([product, ...receiptItems]);
      handleUpdateReceipt({
        tax: 0,
        totalAmount,
        customer: receipt?.customer,
        receiptItems: [product, ...receiptItems],
      });

      Keyboard.dismiss();
      setPrice(undefined);
      setQuantity('');
      setSearchQuery('');
      setSelectedProduct(null);

      showSuccessToast('PRODUCT/SERVICE SUCCESSFULLY ADDED');

      navigation.navigate('ReceiptOtherDetails');
    } else if (items.length) {
      setSelectedProduct(null);
      handleUpdateReceipt({
        tax: 0,
        receiptItems,
        totalAmount,
        customer: receipt?.customer,
      });
      navigation.navigate('ReceiptOtherDetails');
    } else {
      Alert.alert(
        'Info',
        'Please select at least one product/service with quantity',
      );
    }
  }, [
    receiptItems,
    selectedProduct,
    price,
    quantity,
    isNewProduct,
    handleAddProduct,
    searchQuery,
    handleError,
    handleUpdateReceipt,
    totalAmount,
    receipt,
    showSuccessToast,
    navigation,
  ]);

  const renderReceiptItem = useCallback(
    ({item}: ReceiptTableItemProps) => (
      <ReceiptTableItem
        item={item}
        onPress={() => {
          //@ts-ignore
          handleOpenEditReceiptItemModal(item);
        }}
      />
    ),
    [handleOpenEditReceiptItemModal],
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

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setSearchQuery(searchValue);
  }, []);

  const _keyboardDidShow = () => {
    setShowContinueBtn(false);
  };

  const _keyboardDidHide = () => {
    setShowContinueBtn(true);
  };

  const {handleClearReceipt, createReceiptFromCustomer} = useReceiptProvider();

  const handleGoBack = useCallback(() => {
    const goBack = () => {
      handleClearReceipt();
      if (createReceiptFromCustomer) {
        navigation.navigate('CustomerDetails', {
          customer: createReceiptFromCustomer,
        });
      } else {
        navigation.navigate('Home');
      }
    };
    if (receiptItems.length) {
      Alert.alert(
        'Warning',
        'Are you sure you want to exit this page? The receipt has not been created.',
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
  }, [
    createReceiptFromCustomer,
    handleClearReceipt,
    navigation,
    receiptItems.length,
  ]);

  const handleBackButtonPress = useCallback(() => {
    if (!navigation.isFocused()) {
      return false;
    }
    if (receiptItems.length) {
      handleGoBack();
      return true;
    }
    return false;
  }, [navigation, receiptItems.length, handleGoBack]);

  useEffect(() => {
    const total = receiptItems
      .map(({quantity: q, price: p}) => {
        const itemPrice = p ? p : 0;
        const itemQuantity = q ? q : 0;
        return itemPrice * itemQuantity;
      })
      .reduce((acc, curr) => acc + curr, 0);

    setTotalAmount(total);
  }, [receiptItems]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonPress,
      );
    };
  }, [handleBackButtonPress]);

  const unitPriceFieldRef = useRef<TextInput | null>(null);
  const quantityFieldRef = useRef<TextInput | null>(null);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        title="New Receipt"
        headerRight={{options: [{icon: 'x', onPress: handleGoBack}]}}
      />
      <ScrollView
        nestedScrollEnabled
        persistentScrollbar={true}
        keyboardShouldPersistTaps="always"
        style={applyStyles('bg-white flex-1')}>
        <View style={applyStyles('bg-gray-10 px-16 py-32')}>
          <View style={selectedProduct && applyStyles('pb-16')}>
            <AutoComplete<IProduct>
              rightIcon="box"
              items={products}
              value={searchQuery}
              label="Product / Service"
              setFilter={handleProductSearch}
              onClearInput={handleClearState}
              onItemSelect={handleSelectProduct}
              renderItem={renderSearchDropdownItem}
              onChangeText={handleChangeSearchQuery}
              noResultsAction={(productName) => {
                if (productName) {
                  setIsNewProduct(true);
                  setSelectedProduct({name: productName});
                }
              }}
              textInputProps={{
                placeholder: 'Search or enter product/service',
                returnKeyType: 'next',
                onSubmitEditing: () => {
                  setImmediate(() => {
                    if (unitPriceFieldRef.current) {
                      unitPriceFieldRef.current.focus();
                    }
                  });
                },
              }}
            />
          </View>
          {selectedProduct && (
            <>
              <View
                style={applyStyles(
                  'pb-16 flex-row items-center justify-between',
                )}>
                <View style={applyStyles({width: '48%'})}>
                  <CurrencyInput
                    value={price}
                    placeholder="0.00"
                    label="Unit Price"
                    ref={unitPriceFieldRef}
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
                    onSubmitEditing={handleAddReceiptItem}
                  />
                </View>
              </View>
              <Button
                variantColor="clear"
                title="Add to Receipt"
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
            </>
          )}
        </View>
        <FlatList
          data={receiptItems}
          persistentScrollbar
          style={applyStyles('bg-white')}
          renderItem={renderReceiptItem}
          keyboardShouldPersistTaps="always"
          ListHeaderComponent={
            receiptItems.length ? <ReceiptTableHeader /> : undefined
          }
          keyExtractor={(item) => `${item?.product._id?.toString()}`}
          ListEmptyComponent={
            <View style={applyStyles('py-96 center mx-auto')}>
              <Text
                style={applyStyles(
                  'px-48 text-700 text-center text-gray-200 text-uppercase',
                )}>
                There are no products/services in this receipt
              </Text>
            </View>
          }
        />
      </ScrollView>
      <View
        style={applyStyles('px-16 items-end bg-white w-full', {
          elevation: 10,
          borderBottomWidth: 1,
          shadowRadius: 6.27,
          shadowOpacity: 0.34,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          borderBottomColor: colors['gray-10'],
        })}>
        <ReceiptTableFooterItem
          title="Total"
          value={amountWithCurrency(totalAmount)}
        />
      </View>
      {showContinueBtn && (
        <StickyFooter style={applyStyles()}>
          <Button
            title="Continue"
            onPress={handleDone}
            disabled={!receiptItems.length && !selectedProduct}
          />
        </StickyFooter>
      )}
      <EditReceiptItemModal
        item={itemToEdit}
        visible={!!itemToEdit}
        onClose={handleCloseEditReceiptItemModal}
        onRemoveProductItem={handleRemoveReceiptItem}
        onUpdateProductItem={handleUpdateReceiptItem}
      />
    </SafeAreaView>
  );
};
