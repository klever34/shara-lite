import {amountWithCurrency} from '@/helpers/utils';
import {IProduct} from '@/models/Product';
import {IReceiptItem} from '@/models/ReceiptItem';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text} from '@/components';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import {Icon} from '../Icon';
import Touchable from '../Touchable';

export type ReceiptTableItemProps = {
  item: IReceiptItem | IProduct;
  type?: 'receipt' | 'product' | 'stockItem';
};

export const receiptTableStyles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  'column-20': {
    width: '20%',
  },
  'column-40': {
    width: '40%',
  },
});

export const receiptTableHeaderStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-10'],
  },
});

export const receiptTableItemStyles = StyleSheet.create({
  row: {
    borderTopWidth: 1,
    borderTopColor: colors['gray-10'],
  },
});

export const ReceiptTableFooterItem = ({
  title,
  value,
  titleTextStyle,
  valueTextStyle,
}: {
  title: string;
  value: string;
  titleTextStyle?: TextStyle;
  valueTextStyle?: TextStyle;
}) => {
  return (
    <View style={applyStyles('flex-row py-8')}>
      <Text
        style={applyStyles(
          'text-700 text-uppercase text-gray-200',
          titleTextStyle,
        )}>
        {title}
      </Text>
      <Text
        style={applyStyles(
          'pl-xs text-700 text-uppercase text-gray-300',
          valueTextStyle,
        )}>
        {value}
      </Text>
    </View>
  );
};

export const ReceiptTableHeader = ({
  style,
  type = 'receipt',
}: {
  style?: ViewStyle;
  type?: 'receipt' | 'product';
}) => {
  return (
    <View style={applyStyles(receiptTableStyles.row, style)}>
      <View style={receiptTableStyles['column-40']}>
        <Text
          style={applyStyles('text-xs text-400 text-gray-100 text-uppercase')}>
          Product
        </Text>
      </View>
      <View
        style={applyStyles(receiptTableStyles['column-20'], {
          alignItems: 'flex-end',
        })}>
        <Text
          style={applyStyles('text-xs text-400 text-gray-100 text-uppercase')}>
          QTY
        </Text>
      </View>
      <View
        style={applyStyles(receiptTableStyles['column-40'], {
          alignItems: 'flex-end',
        })}>
        <Text
          style={applyStyles('text-xs text-400 text-gray-100 text-uppercase')}>
          {type === 'receipt' ? 'Subtotal' : 'unit price'}
        </Text>
      </View>
    </View>
  );
};

export const ReceiptTableItem = ({
  item,
  onPress,
  type = 'receipt',
}: ReceiptTableItemProps & {
  onPress?: (item: IReceiptItem | IProduct) => void;
}) => {
  const price = item.price ? item.price : 0;
  const quantity = item.quantity ? item.quantity : 0;
  const subtotal = type === 'receipt' ? price * quantity : price;

  return (
    <Touchable onPress={onPress ? () => onPress(item) : undefined}>
      <View
        style={applyStyles(receiptTableStyles.row, receiptTableItemStyles.row)}>
        <View style={receiptTableStyles['column-40']}>
          <Text
            style={applyStyles('pb-4 text-700 text-uppercase text-gray-300')}>
            {'product' in item ? item.product.name : item.name}
          </Text>
          {type === 'receipt' && (
            <Text style={applyStyles('text-uppercase text-gray-100 text-xxs')}>
              Unit price: {amountWithCurrency(price)}
            </Text>
          )}
        </View>
        <View
          style={applyStyles(receiptTableStyles['column-20'], {
            alignItems: 'flex-end',
          })}>
          <Text
            style={applyStyles('pb-4 text-700 text-uppercase text-gray-100')}>
            {quantity}
          </Text>
        </View>
        <View
          style={applyStyles(receiptTableStyles['column-40'], {
            alignItems: 'flex-end',
          })}>
          <Text
            style={applyStyles('pb-4 text-700 text-uppercase text-gray-300')}>
            {amountWithCurrency(subtotal)}
          </Text>
        </View>
        {onPress && (
          <View
            style={applyStyles('flex-row', 'w-full', {
              justifyContent: 'flex-end',
            })}>
            <View
              style={applyStyles('flex-row', 'items-center', 'justify-center')}>
              <Icon
                size={14}
                name="edit"
                type="feathericons"
                color={colors.primary}
              />
              <Text
                style={applyStyles('text-400', 'text-uppercase', 'pl-xs', {
                  fontSize: 12,
                  color: colors.primary,
                })}>
                Edit
              </Text>
            </View>
          </View>
        )}
      </View>
    </Touchable>
  );
};
