import {
  AppInput,
  AutoComplete,
  Button,
  CurrencyInput,
  ReceiptTableFooterItem,
  ReceiptTableHeader,
  ReceiptTableItem,
  ReceiptTableItemProps,
  StickyFooter,
} from '@/components';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, showToast} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {IReceipt} from '@/models/Receipt';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {FormDefaults} from '@/services/FormDefaults';
import {useAppNavigation} from '@/services/navigation';
import {getProducts, saveProduct} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList, Keyboard, Text, View} from 'react-native';
import {EditReceiptItemModal} from './EditReceiptItemModal';
import {useReceiptProvider} from './ReceiptProvider';

type Props = {
  receipt?: IReceipt;
};

export const CreateReceipt = (props: Props) => {
  const {receipt} = props;

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
    setPrice(0);
    setQuantity('');
    setSearchQuery('');
    setItemToEdit(null);
    setSelectedProduct(null);
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    getAnalyticsService().logEvent('receiptStart').catch(handleError);
  }, [handleError, receipt]);

  const handlePriceChange = useCallback((item) => {
    setPrice(item);
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
      item.price === null ? setPrice(0) : setPrice(item?.price);
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
        .logEvent('productAddedToReceipt')
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
      setPrice(0);
      setQuantity('');
      setSearchQuery('');
      setSelectedProduct(null);
      showToast({message: 'PRODUCT/SERVICE SUCCESSFULLY ADDED'});
    } else {
      Alert.alert('Info', 'Please add product/service, quantity & price');
    }
  }, [
    price,
    quantity,
    selectedProduct,
    handleError,
    receiptItems,
    isNewProduct,
    handleAddProduct,
    searchQuery,
  ]);

  const handleDone = useCallback(() => {
    let items = receiptItems;
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

      getAnalyticsService()
        .logEvent('productAddedToReceipt')
        .catch(handleError);

      setReceiptItems([product, ...receiptItems]);
      handleUpdateReceipt({
        tax: 0,
        totalAmount,
        customer: receipt?.customer,
        receiptItems: [product, ...receiptItems],
      });

      Keyboard.dismiss();
      setPrice(0);
      setQuantity('');
      setSearchQuery('');
      setSelectedProduct(null);

      showToast({message: 'PRODUCT/SERVICE SUCCESSFULLY ADDED'});

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

  const handleChangeSearchQuery = useCallback((searchValue) => {
    setSearchQuery(searchValue);
  }, []);

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
    <View style={applyStyles('flex-1')}>
      <FlatList
        data={[]}
        persistentScrollbar
        nestedScrollEnabled
        renderItem={undefined}
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
                  onClearInput={handleClearState}
                  onItemSelect={handleSelectProduct}
                  renderItem={renderSearchDropdownItem}
                  onChangeText={handleChangeSearchQuery}
                  noResultsAction={() => setIsNewProduct(true)}
                  textInputProps={{
                    placeholder: 'Search or enter product/service',
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
            </View>
            <FlatList
              data={receiptItems}
              style={applyStyles('bg-white')}
              renderItem={renderReceiptItem}
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
          </>
        }
      />

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
    </View>
  );
};
