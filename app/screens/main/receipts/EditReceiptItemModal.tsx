import {AppInput, Button, CurrencyInput} from '@/components';
import {numberWithCommas} from '@/helpers/utils';
import {BottomHalfModalContainer} from '@/modals/BottomHalfModal';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAuthService} from '@/services';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useState} from 'react';
import {Text, ToastAndroid, View} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  item: IReceiptItem | null;
  onUpdateProductItem: (item: IReceiptItem) => void;
  onRemoveProductItem: (item: IReceiptItem) => void;
};

export const EditReceiptItemModal = (props: Props) => {
  const {
    item,
    onClose,
    visible,
    onUpdateProductItem,
    onRemoveProductItem,
  } = props;
  const [quantity, setQuantity] = useState<string | undefined>(
    item ? item.quantity.toString() : '',
  );
  const [price, setPrice] = useState<number | undefined>(item?.price);
  const authService = getAuthService();
  const currency = authService.getUserCurrency();

  useEffect(() => {
    setPrice(item?.price);
    setQuantity(item?.quantity.toString());
  }, [item]);

  const handlePriceChange = useCallback((text) => {
    setPrice(text);
  }, []);

  const handleQuantityChange = useCallback((text) => {
    setQuantity(text);
  }, []);

  const handleClose = useCallback(() => {
    setPrice(undefined);
    setQuantity('');
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    if (item) {
      onRemoveProductItem(item);
      handleClose();
      ToastAndroid.show('PRODUCT REMOVED FROM RECEIPT', ToastAndroid.SHORT);
    }
  }, [handleClose, item, onRemoveProductItem]);

  const handleUpdate = useCallback(() => {
    const payload = {
      ...item,
      price: price ? price : 0,
      quantity: quantity ? parseFloat(quantity) : 0,
    } as IReceiptItem;
    onUpdateProductItem && onUpdateProductItem(payload);
    handleClose();
    ToastAndroid.show('PRODUCT EDITED', ToastAndroid.SHORT);
  }, [item, price, quantity, onUpdateProductItem, handleClose]);

  const getSubtotal = useCallback(() => {
    const p = price ? price : 0;
    const q = quantity ? parseFloat(quantity) : 0;
    const total = p * q;
    return numberWithCommas(total);
  }, [price, quantity]);

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
                'pb-32 text-lg text-gray-200 text-center text-uppercase text-700',
              )}>
              {item?.product.name}
            </Text>
            <View
              style={applyStyles(
                'flex-row items-center mb-24 justify-between',
              )}>
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
            <View style={applyStyles('mb-24')}>
              <AppInput
                label="Subtotal"
                editable={false}
                value={getSubtotal()}
                leftIcon={
                  <Text style={applyStyles('text-base text-gray-300 text-400')}>
                    {currency}
                  </Text>
                }
              />
            </View>
          </View>
        </View>
        <View
          style={applyStyles(
            'flex-row items-center py-12 px-16 bg-white justify-between',
            {
              borderTopWidth: 1,
              borderTopColor: colors['gray-20'],
            },
          )}>
          <Button
            title="Delete"
            variantColor="clear"
            onPress={handleDelete}
            style={applyStyles({
              width: '48%',
            })}
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
