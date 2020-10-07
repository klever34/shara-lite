import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {IReceiptItem} from '@/models/ReceiptItem';
import {colors} from '@/styles';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Touchable from '../Touchable';

export type SummaryTableItemProps = {
  item: IReceiptItem;
};

export const summaryTableStyles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  column: {
    height: 48,
    borderRightWidth: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
    borderRightColor: colors['gray-20'],
  },
  'column-20': {
    width: '20%',
  },
  'column-25': {
    width: '25%',
  },
  'column-10': {
    width: '10%',
  },
  'column-40': {
    width: '40%',
  },
  'column-30': {
    width: '30%',
  },
});

export const summaryTableHeaderStyles = StyleSheet.create({
  row: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors['gray-20'],
    borderBottomColor: colors['gray-20'],
  },
  text: {
    fontFamily: 'Rubik-Medium',
    color: colors['gray-300'],
  },
});

export const summaryTableItemStyles = StyleSheet.create({
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
  },
  text: {
    fontFamily: 'Rubik-Regular',
    color: colors['gray-300'],
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Rubik-Regular',
    color: colors['gray-200'],
  },
});

export const SummaryTableHeader = () => {
  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableHeaderStyles.row)}>
      <View
        style={applyStyles(
          'px-xs',
          summaryTableStyles.column,
          summaryTableStyles['column-30'],
        )}>
        <Text style={summaryTableHeaderStyles.text}>Product</Text>
      </View>
      <View
        style={applyStyles(
          'px-xs',
          summaryTableStyles.column,
          summaryTableStyles['column-30'],
          {
            alignItems: 'flex-end',
          },
        )}>
        <Text style={summaryTableHeaderStyles.text}>Unit Price</Text>
      </View>
      <View
        style={applyStyles(
          'px-xs',
          summaryTableStyles['column-10'],
          summaryTableStyles.column,
          {
            alignItems: 'flex-end',
          },
        )}>
        <Text style={summaryTableHeaderStyles.text}>QTY</Text>
      </View>
      <View
        style={applyStyles(
          'px-xs justify-center',
          summaryTableStyles['column-30'],
          {
            alignItems: 'flex-end',
          },
        )}>
        <Text style={summaryTableHeaderStyles.text}>Price</Text>
      </View>
    </View>
  );
};

export const SummaryTableFooter = ({
  tax,
  totalAmount,
}: {
  tax?: number;
  totalAmount?: number;
}) => {
  return (
    <>
      <View
        style={applyStyles(
          summaryTableStyles.row,
          summaryTableHeaderStyles.row,
          {
            borderTopWidth: 0,
            backgroundColor: colors['gray-10'],
          },
        )}>
        <View
          style={applyStyles(
            summaryTableStyles.column,
            summaryTableStyles['column-30'],
            {
              height: 30,
            },
          )}
        />
        <View
          style={applyStyles(
            summaryTableStyles.column,
            summaryTableStyles['column-30'],
            {
              height: 30,
              alignItems: 'flex-end',
            },
          )}
        />
        <View
          style={applyStyles(
            summaryTableStyles['column-10'],
            summaryTableStyles.column,
            {
              height: 30,
              alignItems: 'flex-end',
            },
          )}
        />
        <View
          style={applyStyles(summaryTableStyles['column-30'], {
            height: 30,
            alignItems: 'flex-end',
          })}
        />
      </View>
      <View
        style={applyStyles('flex-row', {
          height: 30,
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <View
          style={applyStyles('px-xs items-end justify-center', {
            width: '70%',
            borderRightWidth: 1,
            borderRightColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('text-400', {color: colors['gray-300']})}>
            Subtotal
          </Text>
        </View>
        <View
          style={applyStyles('px-xs items-end justify-center', {
            width: '30%',
          })}>
          <Text style={applyStyles('text-400', {color: colors['gray-300']})}>
            {amountWithCurrency(totalAmount)}
          </Text>
        </View>
      </View>
      <View
        style={applyStyles('flex-row', {
          height: 30,
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <View
          style={applyStyles('px-xs items-end justify-center', {
            width: '70%',
            borderRightWidth: 1,
            borderRightColor: colors['gray-20'],
          })}>
          <Text style={applyStyles('text-400', {color: colors['gray-300']})}>
            Tax
          </Text>
        </View>
        <View
          style={applyStyles('px-xs items-end justify-center', {
            width: '30%',
          })}>
          <Text style={applyStyles('text-400', {color: colors['gray-300']})}>
            {amountWithCurrency(tax)}
          </Text>
        </View>
      </View>
      <View
        style={applyStyles('flex-row', {
          height: 30,
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <View
          style={applyStyles('px-xs items-end justify-center', {
            width: '70%',
            borderRightWidth: 1,
            borderRightColor: colors['gray-20'],
          })}>
          <Text
            style={applyStyles('text-500 text-uppercase', {
              color: colors['gray-300'],
            })}>
            Total
          </Text>
        </View>
        <View
          style={applyStyles('px-xs items-end justify-center', {
            width: '30%',
          })}>
          <Text style={applyStyles('text-400', {color: colors['gray-300']})}>
            {amountWithCurrency((totalAmount ?? 0) + (tax ?? 0))}
          </Text>
        </View>
      </View>
    </>
  );
};

export const SummaryTableItem = ({
  item,
  onPress,
}: SummaryTableItemProps & {onPress?: (item: IReceiptItem) => void}) => {
  const price = item.price ? item.price : 0;
  const quantity = item.quantity ? item.quantity : 0;
  const subtotal = price * quantity;

  return (
    <Touchable onPress={onPress ? () => onPress(item) : undefined}>
      <View
        style={applyStyles(summaryTableStyles.row, summaryTableItemStyles.row)}>
        <View
          style={applyStyles(
            summaryTableStyles.column,
            summaryTableStyles['column-30'],
          )}>
          <Text style={summaryTableItemStyles.text}>{item.product.name}</Text>
        </View>
        <View
          style={applyStyles(
            summaryTableStyles['column-30'],
            summaryTableStyles.column,
            {
              alignItems: 'flex-end',
            },
          )}>
          <Text style={summaryTableItemStyles.text}>
            {amountWithCurrency(item.price)}
          </Text>
        </View>
        <View
          style={applyStyles(
            summaryTableStyles['column-10'],
            summaryTableStyles.column,
            {
              alignItems: 'flex-end',
            },
          )}>
          <Text style={summaryTableItemStyles.text}>{quantity}</Text>
        </View>
        <View
          style={applyStyles(
            'justify-center',
            summaryTableStyles['column-30'],
            {
              alignItems: 'flex-end',
            },
          )}>
          <Text style={summaryTableItemStyles.text}>
            {amountWithCurrency(subtotal)}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
