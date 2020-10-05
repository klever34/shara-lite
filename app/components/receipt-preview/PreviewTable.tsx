import React from 'react';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {IReceiptItem} from '@/models/ReceiptItem';
import {colors} from '@/styles';
import {StyleSheet, Text, View} from 'react-native';

export type SummaryTableItemProps = {
  item: IReceiptItem;
};

export const summaryTableStyles = StyleSheet.create({
  row: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  column: {
    height: 30,
    borderRightWidth: 1,
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
          summaryTableStyles.column,
          summaryTableStyles['column-30'],
        )}>
        <Text style={summaryTableHeaderStyles.text}>Product</Text>
      </View>
      <View
        style={applyStyles(
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
          summaryTableStyles['column-10'],
          summaryTableStyles.column,
          {
            alignItems: 'flex-end',
          },
        )}>
        <Text style={summaryTableHeaderStyles.text}>QTY</Text>
      </View>
      <View
        style={applyStyles('justify-center', summaryTableStyles['column-30'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableHeaderStyles.text}>Price</Text>
      </View>
    </View>
  );
};

export const SummaryTableFooter = () => {
  return (
    <View
      style={applyStyles(summaryTableStyles.row, summaryTableHeaderStyles.row, {
        borderTopWidth: 0,
        backgroundColor: colors['gray-10'],
      })}>
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
  );
};

export const SummaryTableItem = ({
  item,
}: SummaryTableItemProps & {onPress?: (item: IReceiptItem) => void}) => {
  const price = item.price ? item.price : 0;
  const quantity = item.quantity ? item.quantity : 0;
  const subtotal = price * quantity;

  return (
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
        style={applyStyles('justify-center', summaryTableStyles['column-30'], {
          alignItems: 'flex-end',
        })}>
        <Text style={summaryTableItemStyles.text}>
          {amountWithCurrency(subtotal)}
        </Text>
      </View>
    </View>
  );
};
