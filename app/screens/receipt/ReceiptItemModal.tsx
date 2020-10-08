import {Button, CurrencyInput} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {
  getProducts,
  saveProduct,
  updateProduct,
} from '@/services/ProductService';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {omit} from 'lodash';
import React, {useCallback, useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';

type Props = {
  item?: IReceiptItem;
  onDelete?: () => void;
  closeModal: () => void;
  onDone: (item: IReceiptItem) => void;
};

type SectionProps = {
  onPrevious?(): void;
  receiptItem: IReceiptItem;
  onNext(data: string | number | IProduct, key: string): void;
};

const sectionTitle = {
  0: 'Item',
  1: 'Unit Price',
  2: 'Quantity',
} as {[key: number]: string};

const SectionButtons = ({
  onNext,
  onPrevious,
  nextButtonText,
  previousButtonText,
  nextButtonDisabled,
}: {
  onNext(): void;
  onPrevious?(): void;
  nextButtonText: string;
  previousButtonText?: string;
  nextButtonDisabled?: boolean;
}) => {
  const positionStyle = onPrevious ? 'justify-between' : 'justify-end';
  return (
    <View
      style={applyStyles('px-md py-sm flex-row', positionStyle, {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: colors['gray-50'],
        borderBottomColor: colors['gray-50'],
      })}>
      {onPrevious && (
        <Button variantColor="clear" onPress={onPrevious}>
          <View
            style={applyStyles('p-md flex-row center', {
              borderWidth: 1,
              borderRadius: 8,
              borderColor: colors['gray-200'],
            })}>
            <Icon
              size={16}
              type="feathericons"
              name="chevron-left"
              color={colors['gray-200']}
            />
            <Text style={applyStyles('text-500', {color: colors['gray-200']})}>
              {previousButtonText}
            </Text>
          </View>
        </Button>
      )}
      <Button
        disabled={nextButtonDisabled}
        variantColor="clear"
        onPress={onNext}>
        <View
          style={applyStyles('p-md flex-row center', {
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          })}>
          <Text style={applyStyles('text-500 text-white')}>
            {nextButtonText}
          </Text>
          <Icon
            size={16}
            type="feathericons"
            name="chevron-right"
            color={colors.white}
          />
        </View>
      </Button>
    </View>
  );
};

const ItemNameSection = ({onNext, receiptItem}: SectionProps) => {
  const realm = useRealm();
  const handleError = useErrorHandler();
  const myProducts = getProducts({realm});

  const [productIsNew, setProductIsNew] = useState(false);
  const [name, setName] = useState(receiptItem.name || '');
  const [product, setProduct] = useState<IProduct>(
    receiptItem.product || ({} as IProduct),
  );
  const [products, setProducts] = useState<IProduct[]>(myProducts || []);

  const handleAddProduct = useCallback(() => {
    getAnalyticsService()
      .logEvent('productStart')
      .then(() => {});
    const createdProduct = saveProduct({
      realm,
      product: {name},
    });
    getAnalyticsService().logEvent('productAdded').catch(handleError);
    setName(createdProduct.name);
    setProduct(createdProduct);
    setProductIsNew(false);
  }, [handleError, name, realm]);

  const handleSearch = useCallback(
    (searchedText: string) => {
      setProductIsNew(false);
      if (searchedText) {
        const searchValue = searchedText.trim();
        const sort = (item: IProduct, text: string) => {
          return (
            item.name &&
            item.name.toLowerCase().indexOf(text.toLowerCase()) > -1
          );
        };
        const results = products.filter((item: IProduct) => {
          return sort(item, searchValue);
        });
        if (results.length) {
          setProducts(results);
        } else {
          setProductIsNew(true);
          setProducts(myProducts);
        }
      }
    },
    [myProducts, products],
  );

  const handleNameChange = useCallback(
    (value) => {
      setName(value);
      handleSearch(value);
    },
    [handleSearch],
  );

  const handleProductSelect = useCallback((selectedProduct: IProduct) => {
    setName(selectedProduct.name);
    setProduct(selectedProduct);
  }, []);

  const handleNextClick = useCallback(() => {
    setProductIsNew(false);
    onNext(product, 'product');
  }, [onNext, product]);

  const renderProductItem = useCallback(
    ({item}: {item: IProduct}) => {
      return (
        <Touchable onPress={() => handleProductSelect(item)}>
          <View
            style={applyStyles('px-lg flex-row items-center justify-between', {
              height: 60,
              borderBottomWidth: 1,
              borderColor: colors['gray-20'],
            })}>
            <View>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {item.name}
              </Text>
            </View>
            <View>
              <Text
                style={applyStyles('text-400', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                {amountWithCurrency(item.price)}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleProductSelect],
  );

  return (
    <View>
      <View style={applyStyles('pt-16 pb-96')}>
        <FlatList
          data={products}
          persistentScrollbar
          initialNumToRender={10}
          stickyHeaderIndices={[0]}
          renderItem={renderProductItem}
          keyExtractor={(item) => `${item._id}`}
          ListHeaderComponent={
            <View style={applyStyles('bg-white')}>
              <TextInput
                value={name}
                onChangeText={(text) => handleNameChange(text)}
                style={applyStyles('px-12 py-0 mb-96 text-400', {
                  fontSize: 16,
                })}
                placeholder="Enter item name here..."
              />
              <SectionButtons
                onNext={handleNextClick}
                nextButtonText="Unit Price"
                nextButtonDisabled={!product._id}
              />
              {productIsNew && (
                <Touchable onPress={() => handleAddProduct()}>
                  <View
                    style={applyStyles('px-lg flex-row items-center', {
                      height: 60,
                      borderBottomWidth: 1,
                      backgroundColor: colors['gray-10'],
                      borderBottomColor: colors['gray-20'],
                    })}>
                    <View style={applyStyles('flex-row items-center')}>
                      <Icon
                        name="plus"
                        size={14}
                        type="feathericons"
                        color={colors.primary}
                      />
                      <Text
                        style={applyStyles('pl-xl text-400', {
                          color: colors.primary,
                        })}>
                        Add
                      </Text>
                    </View>
                    <Text style={applyStyles('pl-xs text-500')}>{name}</Text>
                  </View>
                </Touchable>
              )}
            </View>
          }
        />
      </View>
    </View>
  );
};

const ItemUnitPriceSection = ({
  onNext,
  receiptItem,
  onPrevious,
}: SectionProps) => {
  const [price, setPrice] = useState(receiptItem.price || 0);

  const handlePriceChange = useCallback((value) => {
    setPrice(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pb-96')}>
        <View style={applyStyles('mx-12 py-0', {fontSize: 16})}>
          <CurrencyInput
            value={price.toString()}
            iconStyle={applyStyles({top: -12})}
            inputStyle={applyStyles({borderBottomWidth: 0, paddingTop: 0})}
            onChange={(text) => handlePriceChange(text)}
            placeholder="Enter item unit price here..."
          />
        </View>
      </View>
      <SectionButtons
        onPrevious={onPrevious}
        nextButtonText="Quantity"
        previousButtonText="Item Name"
        onNext={() => onNext(price, 'price')}
      />
    </View>
  );
};

const ItemQuantitySection = ({
  onNext,
  receiptItem,
  onPrevious,
}: SectionProps) => {
  const [quantity, setQuantity] = useState(
    (receiptItem.quantity && receiptItem.quantity.toString()) || '',
  );

  const handleQuantityChange = useCallback((value) => {
    setQuantity(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pt-16 pb-96')}>
        <TextInput
          value={quantity}
          keyboardType="numeric"
          onChangeText={(text) => handleQuantityChange(text)}
          style={applyStyles('px-12 py-0 text-400', {fontSize: 16})}
          placeholder="Enter quantity here..."
        />
      </View>

      <SectionButtons
        nextButtonText="Done"
        onPrevious={onPrevious}
        nextButtonDisabled={!quantity}
        previousButtonText="Unit Price"
        onNext={() => onNext(parseFloat(quantity), 'quantity')}
      />
    </View>
  );
};

export const ReceiptItemModalContent = (props: Props) => {
  const {item, closeModal, onDone, onDelete} = props;

  const realm = useRealm();

  const [section, setSection] = useState(0);
  const [receiptItem, setReceiptItem] = useState<IReceiptItem>(
    item || ({} as IReceiptItem),
  );

  const addReceiptItemPrice = useCallback(
    (payload: IReceiptItem) => {
      let result;
      if ('product' in payload) {
        if (!payload.product.price && payload.price !== 0) {
          updateProduct({
            realm,
            product: payload.product,
            updates: {price: payload.price},
          });
        }
        result = {...payload, total_price: payload.price * payload.quantity};
        return result;
      } else {
        return payload;
      }
    },
    [realm],
  );

  const handlePrevious = useCallback(() => {
    if (section > 0) {
      setSection(section - 1);
    }
  }, [section]);

  const handleNext = useCallback(
    (data: string | number | IProduct, key: string) => {
      let payload = {
        ...omit(receiptItem),
        [key]: data,
      };

      if (key === 'product' && !item) {
        payload = {
          ...payload,
          //@ts-ignore
          name: data.name,
          //@ts-ignore
          price: data.price,
        };
      }
      if (section < 2) {
        setReceiptItem(payload);
        setSection(section + 1);
      } else {
        payload = addReceiptItemPrice(payload);
        setReceiptItem(payload);
        onDone(payload);
        closeModal();
      }
    },
    [item, receiptItem, section, addReceiptItemPrice, onDone, closeModal],
  );

  return (
    <View>
      <View
        style={applyStyles(
          'px-xs bg-white flex-row items-center justify-between',
          {
            height: 80,
            elevation: 3,
          },
        )}>
        <Touchable onPress={closeModal}>
          <View
            style={applyStyles('px-sm flex-row items-center', {height: 48})}>
            <Icon type="feathericons" name="arrow-left" size={24} />
            <Text
              style={applyStyles('pl-sm text-500', {
                fontSize: 18,
                color: colors['gray-300'],
              })}>
              {sectionTitle[section]}
            </Text>
          </View>
        </Touchable>
        {onDelete && (
          <Touchable onPress={onDelete}>
            <View style={applyStyles('px-md flex-row center', {height: 48})}>
              <Icon
                size={24}
                name="trash-2"
                type="feathericons"
                color={colors.primary}
              />
            </View>
          </Touchable>
        )}
      </View>
      <View>
        {section === 0 && (
          <ItemNameSection receiptItem={receiptItem} onNext={handleNext} />
        )}
        {section === 1 && (
          <ItemUnitPriceSection
            onNext={handleNext}
            receiptItem={receiptItem}
            onPrevious={handlePrevious}
          />
        )}
        {section === 2 && (
          <ItemQuantitySection
            onNext={handleNext}
            receiptItem={receiptItem}
            onPrevious={handlePrevious}
          />
        )}
      </View>
    </View>
  );
};
