import {Button, CurrencyInput} from 'app-v3/components';
import {Icon} from 'app-v3/components/Icon';
import Touchable from 'app-v3/components/Touchable';
import {amountWithCurrency} from 'app-v3/helpers/utils';
import {IProduct} from 'app-v3/models/Product';
import {IReceiptItem} from 'app-v3/models/ReceiptItem';
import {getAnalyticsService} from 'app-v3/services';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {
  getProducts,
  saveProduct,
  updateProduct,
} from 'app-v3/services/ProductService';
import {useRealm} from 'app-v3/services/realm';
import {colors} from 'app-v3/styles';
import {omit, orderBy} from 'lodash';
import React, {useCallback, useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';
import {applyStyles} from 'app-v3/styles';

type Props = {
  onDelete?: () => void;
  closeModal: () => void;
  type?: 'receipt' | 'item';
  item?: IProduct | IReceiptItem;
  onDone: (item: IProduct | IReceiptItem) => void;
};

type SectionProps = {
  onPrevious?(): void;
  type?: Props['type'];
  receiptItem?: IProduct | IReceiptItem;
  onNext(data: string | number | IProduct, key: string): void;
};

const sectionTitle = {
  0: 'Item',
  1: 'Unit Price',
  2: 'Quantity',
  3: 'Note',
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

function isTypeReceiptItem(
  value?: IReceiptItem | IProduct,
): value is IReceiptItem {
  return value ? value.hasOwnProperty('product') : false;
}

const ItemNameSection = ({type, onNext, receiptItem}: SectionProps) => {
  const realm = useRealm();
  const handleError = useErrorHandler();
  const myProducts = getProducts({realm});
  const sortedProducts = orderBy(myProducts, 'name', 'asc');

  const [productIsNew, setProductIsNew] = useState(false);
  const [name, setName] = useState(receiptItem?.name || '');
  const [product, setProduct] = useState<IProduct | undefined>(
    isTypeReceiptItem(receiptItem)
      ? receiptItem?.product || ({} as IProduct)
      : undefined,
  );
  const [products, setProducts] = useState<IProduct[]>(sortedProducts || []);

  const handleAddProduct = useCallback(() => {
    getAnalyticsService().logEvent('productStart').catch(handleError);
    const createdProduct = saveProduct({
      realm,
      product: {name},
    });
    getAnalyticsService().logEvent('productAdded').catch(handleError);
    setName(createdProduct.name);
    setProduct(createdProduct);
    setProductIsNew(false);
    type === 'receipt'
      ? onNext(createdProduct, 'product')
      : onNext(createdProduct.name, 'name');
  }, [handleError, name, onNext, realm, type]);

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
      type === 'receipt' && handleSearch(value);
    },
    [handleSearch, type],
  );

  const handleProductSelect = useCallback(
    (selectedProduct: IProduct) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          item_id: String(selectedProduct._id),
          content_type: 'Product',
        })
        .catch(handleError);
      setName(selectedProduct.name);
      setProduct(selectedProduct);
      setProductIsNew(false);
      type === 'receipt'
        ? onNext(selectedProduct, 'product')
        : onNext(selectedProduct.name, 'name');
    },
    [handleError, onNext, type],
  );

  const handleNextClick = useCallback(() => {
    setProductIsNew(false);
    type === 'receipt' && product
      ? onNext(product, 'product')
      : onNext(name, 'name');
  }, [name, onNext, product, type]);

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
          keyboardShouldPersistTaps="always"
          renderItem={type === 'receipt' ? renderProductItem : undefined}
          keyExtractor={(item) => `${item._id}`}
          ListHeaderComponent={
            <View style={applyStyles('bg-white')}>
              <TextInput
                value={name}
                onChangeText={(text) => handleNameChange(text)}
                style={applyStyles('px-12 py-0 pb-56 text-400', {
                  fontSize: 16,
                })}
                placeholder="Enter item name here..."
              />
              <SectionButtons
                onNext={handleNextClick}
                nextButtonText="Unit Price"
                nextButtonDisabled={type === 'receipt' ? !product?._id : !name}
              />
              {productIsNew && type === 'receipt' && (
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
  onPrevious,
  receiptItem,
}: SectionProps) => {
  const [price, setPrice] = useState(receiptItem?.price || 0);

  const handlePriceChange = useCallback((value) => {
    setPrice(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('mx-12 py-0', {fontSize: 16})}>
        <CurrencyInput
          value={price.toString()}
          iconStyle={applyStyles({top: -12})}
          inputStyle={applyStyles('pb-56', {
            borderBottomWidth: 0,
            paddingTop: 0,
          })}
          onChange={(text) => handlePriceChange(text)}
          placeholder="Enter item unit price here..."
        />
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
    (receiptItem?.quantity && receiptItem.quantity.toString()) || '',
  );

  const handleQuantityChange = useCallback((value) => {
    setQuantity(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pt-16')}>
        <TextInput
          value={quantity}
          keyboardType="numeric"
          onChangeText={(text) => handleQuantityChange(text)}
          style={applyStyles('px-12 pb-56 py-0 text-400', {fontSize: 16})}
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

const ItemNoteSection = ({onNext, onPrevious}: SectionProps) => {
  const [note, setNote] = useState('');

  const handleNoteChange = useCallback((value) => {
    setNote(value);
  }, []);

  return (
    <View>
      <View style={applyStyles('pt-16 pb-56')}>
        <TextInput
          multiline
          value={note}
          onChangeText={(text) => handleNoteChange(text)}
          style={applyStyles('px-12 py-0 text-400', {fontSize: 16})}
          placeholder="Enter quantity here..."
        />
      </View>

      <SectionButtons
        nextButtonText="Done"
        onPrevious={onPrevious}
        previousButtonText="Quantity"
        onNext={() => onNext(note, 'note')}
      />
    </View>
  );
};

export const ReceiptItemModalContent = (props: Props) => {
  const {item, type = 'receipt', closeModal, onDone, onDelete} = props;

  const realm = useRealm();

  const [section, setSection] = useState(0);
  const [receiptItem, setReceiptItem] = useState<IReceiptItem | IProduct>(
    item || ({} as IReceiptItem | IProduct),
  );

  const addReceiptItemPrice = useCallback(
    (payload: IReceiptItem | IProduct) => {
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
        closeModal?.();
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
            height: 64,
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
          <ItemNameSection
            type={type}
            onNext={handleNext}
            receiptItem={receiptItem}
          />
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
        {section === 3 && type === 'item' && (
          <ItemNoteSection onNext={handleNext} onPrevious={handlePrevious} />
        )}
      </View>
    </View>
  );
};
