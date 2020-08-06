import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {
  Button,
  FloatingLabelInput,
  CurrencyInput,
} from '../../../../components';
import {colors} from '../../../../styles';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {IReceiptItem} from '../../../../models/ReceiptItem';
import {getAuthService} from '../../../../services';

type Props = {
  visible: boolean;
  onClose: () => void;
  item: IReceiptItem | null;
  onUpdateProductItem: (item: IReceiptItem) => void;
  onRemoveProductItem: (item: IReceiptItem) => void;
};

export const EditProductModal = (props: Props) => {
  const {
    item,
    onClose,
    visible,
    onUpdateProductItem,
    onRemoveProductItem,
  } = props;
  const [price, setPrice] = useState<string | undefined>(
    item ? item.price.toString() : '',
  );
  const [quantity, setQuantity] = useState<string | undefined>(
    item ? item.quantity.toString() : '',
  );
  const authService = getAuthService();
  const currency = authService.getUserCurrency();

  useEffect(() => {
    setPrice(item?.price.toString());
    setQuantity(item?.quantity.toString());
  }, [item]);

  const handlePriceChange = useCallback((text) => {
    setPrice(text);
  }, []);

  const handleQuantityChange = useCallback((text) => {
    setQuantity(text);
  }, []);

  const handleClose = useCallback(() => {
    setPrice('');
    setQuantity('');
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    if (item) {
      onRemoveProductItem(item);
      handleClose();
    }
  }, [handleClose, item, onRemoveProductItem]);

  const handleUpdate = useCallback(() => {
    const payload = {
      ...item,
      price: price ? parseFloat(price) : 0,
      quantity: quantity ? parseFloat(quantity) : 0,
    } as IReceiptItem;
    onUpdateProductItem && onUpdateProductItem(payload);
    handleClose();
  }, [item, price, quantity, onUpdateProductItem, handleClose]);

  const getSubtotal = useCallback(() => {
    const p = price ? parseFloat(price) : 0;
    const q = quantity ? parseFloat(quantity) : 0;
    const total = p * q;
    return numberWithCommas(total);
  }, [price, quantity]);

  return (
    <Modal
      isVisible={visible}
      onSwipeComplete={handleClose}
      onBackButtonPress={handleClose}
      style={applyStyles({
        margin: 0,
        justifyContent: 'flex-end',
      })}>
      <View
        style={applyStyles({
          backgroundColor: colors.white,
        })}>
        <View style={styles.calculatorSection}>
          <View>
            <Text style={applyStyles(styles.selectedProductName, 'text-700')}>
              {`${item?.product.sku}-${item?.product.name}`}{' '}
              {item?.weight ? `(${item?.weight})` : ''}
            </Text>
            <View style={styles.calculatorSectionInputs}>
              <View
                style={applyStyles('flex-row', 'items-center', {
                  width: '48%',
                })}>
                <CurrencyInput
                  value={price}
                  label="Unit Price"
                  onChange={handlePriceChange}
                />
              </View>
              <View
                style={applyStyles('text-400', {
                  width: '48%',
                })}>
                <FloatingLabelInput
                  value={quantity}
                  label="Quantity"
                  keyboardType="numeric"
                  onChangeText={handleQuantityChange}
                />
              </View>
            </View>
            <View style={styles.calculatorSectionInputs}>
              <FloatingLabelInput
                label="Subtotal"
                editable={false}
                value={getSubtotal()}
                leftIcon={
                  <Text style={applyStyles(styles.inputIconText, 'text-400')}>
                    {currency}
                  </Text>
                }
              />
            </View>
          </View>
        </View>
        <View style={styles.calculatorSectionButtons}>
          <Button
            title="Delete"
            variantColor="clear"
            onPress={handleDelete}
            style={styles.calculatorSectionButton}
          />
          <Button
            title="Update"
            variantColor="red"
            onPress={handleUpdate}
            style={styles.calculatorSectionButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  recentProductsHeader: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    color: colors['gray-300'],
    textTransform: 'uppercase',
    borderBottomColor: colors['gray-20'],
  },
  recentProductsList: {
    height: 200,
  },
  recentProductItem: {
    fontSize: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  recentProductItemText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  calculatorSection: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedProductName: {
    fontSize: 18,
    paddingBottom: 24,
    textAlign: 'center',
    color: colors.primary,
  },
  calculatorSectionInputs: {
    marginBottom: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calculatorSectionButtons: {
    borderTopWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    borderTopColor: colors['gray-20'],
  },
  calculatorSectionButton: {
    width: '48%',
  },
  inputIconText: {
    fontSize: 16,
    color: colors['gray-300'],
  },
});
