import {AppInput, Button, CurrencyInput} from '@/components';
import {BottomHalfModalContainer} from '@/modals/BottomHalfModal';
import {IProduct} from '@/models/Product';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Text, ToastAndroid, View} from 'react-native';

type Props = {
  visible: boolean;
  isDelete?: boolean;
  onClose: () => void;
  item: IProduct | null;
  onUpdateProductItem?: (item: IProduct) => void;
  onRemoveProductItem?: (item: IProduct) => void;
};

export const EditProductModal = (props: Props) => {
  const {
    item,
    onClose,
    visible,
    isDelete = false,
    onRemoveProductItem,
    onUpdateProductItem,
  } = props;

  const [name, setName] = useState(item?.name);
  const [quantity, setQuantity] = useState<string | undefined>(
    item && item?.quantity && !(item?.quantity < 0)
      ? item?.quantity?.toString()
      : '0',
  );
  const [price, setPrice] = useState<number | undefined>(item?.price);

  useEffect(() => {
    setName(item?.name);
    setPrice(item?.price);
    setQuantity(
      item && item?.quantity && !(item?.quantity < 0)
        ? item?.quantity?.toString()
        : '0',
    );
  }, [item]);

  const handleNameChange = useCallback((text) => {
    setName(text);
  }, []);

  const handlePriceChange = useCallback((text) => {
    setPrice(text);
  }, []);

  const handleQuantityChange = useCallback((text) => {
    setQuantity(text);
  }, []);

  const handleClose = useCallback(() => {
    setName('');
    setQuantity('');
    setPrice(undefined);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    if (item) {
      onRemoveProductItem && onRemoveProductItem(item);
      handleClose();
      ToastAndroid.show('PRODUCT REMOVED FROM RECEIPT', ToastAndroid.SHORT);
    }
  }, [handleClose, item, onRemoveProductItem]);

  const handleUpdate = useCallback(() => {
    const payload = {
      ...item,
      name,
      price: price ? price : 0,
      quantity: quantity ? parseFloat(quantity) : 0,
    } as IProduct;
    onUpdateProductItem && onUpdateProductItem(payload);
    handleClose();
    ToastAndroid.show('PRODUCT EDITED', ToastAndroid.SHORT);
  }, [item, name, price, quantity, onUpdateProductItem, handleClose]);

  return (
    <BottomHalfModalContainer visible={visible} onClose={handleClose}>
      <View
        style={applyStyles({
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.white,
        })}>
        <View style={applyStyles('py-8 px-16')}>
          <View>
            <Text
              style={applyStyles(
                'pb-32 text-base text-gray-200 text-center text-uppercase text-700',
              )}>
              edit
            </Text>
            <View style={applyStyles('mb-16')}>
              <AppInput
                value={name}
                label="Product / service"
                onChangeText={handleNameChange}
                placeholder="Enter product / service name here"
              />
            </View>
            <View style={applyStyles('flex-row items-center justify-between')}>
              <View
                style={applyStyles({
                  width: '48%',
                })}>
                <CurrencyInput
                  label="Unit Price"
                  value={price?.toString()}
                  onChange={handlePriceChange}
                />
              </View>
              <View
                style={applyStyles({
                  width: '48%',
                })}>
                <AppInput
                  value={quantity}
                  label="Quantity"
                  keyboardType="numeric"
                  onChangeText={handleQuantityChange}
                />
              </View>
            </View>
          </View>
        </View>
        <View
          style={applyStyles(
            'flex-row items-center py-16 px-16 justify-between',
          )}>
          <Button
            variantColor="transparent"
            style={applyStyles({
              width: '48%',
            })}
            title={isDelete ? 'Delete' : 'Cancel'}
            onPress={isDelete ? handleDelete : handleClose}
          />
          <Button
            title="Update"
            variantColor="red"
            onPress={handleUpdate}
            style={applyStyles({
              width: '48%',
            })}
          />
        </View>
      </View>
    </BottomHalfModalContainer>
  );
};
