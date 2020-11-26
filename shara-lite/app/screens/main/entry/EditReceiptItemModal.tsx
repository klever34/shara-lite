import {AppInput, Button, CurrencyInput} from '@/components';
import {numberWithCommas, showToast} from '@/helpers/utils';
import {BottomHalfModalContainer} from '@/modals/BottomHalfModal';
import {IReceiptItem} from '@/models/ReceiptItem';
import {getAuthService} from '@/services';
import {applyStyles, colors} from '@/styles';
import {omit} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {Text, View} from 'react-native';

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
      showToast({message: 'PRODUCT REMOVED FROM RECEIPT'});
    }
  }, [handleClose, item, onRemoveProductItem]);

  const handleUpdate = useCallback(() => {
    const payload = {
      ...omit(item),
      price: price ? price : 0,
      quantity: quantity ? parseFloat(quantity) : 0,
    } as IReceiptItem;
    onUpdateProductItem && onUpdateProductItem(payload);
    handleClose();
    showToast({message: 'PRODUCT EDITED'});
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
                'pb-32 text-base text-gray-200 text-center text-uppercase text-700',
              )}>
              {item?.product.name}
            </Text>
            <View
              style={applyStyles(
                'flex-row items-center mb-16 justify-between',
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
            <View>
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
            'flex-row items-center py-16 px-16 bg-white justify-between',
          )}>
          <Button
            title="Delete"
            variantColor="transparent"
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
