import {amountWithCurrency} from '@/helpers/utils';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';

type Props = {
  totalAmount: number;
  amountPaid: number;
  totalEntries: number;
  style?: ViewStyle;
};

export const ReportListHeader = ({
  style,
  amountPaid,
  totalEntries,
  totalAmount,
}: Props) => {
  return (
    <View
      style={applyStyles(
        'px-16 py-8 flex-row flex-wrap',
        {borderBottomWidth: 1.5, borderBottomColor: colors['gray-20']},
        style,
      )}>
      <View style={applyStyles({width: '40%'})}>
        <Text
          style={applyStyles(
            'pb-4 text-xs text-400 text-gray-200 text-uppercase',
          )}>
          Transactions
        </Text>
        <Text style={applyStyles('text-xs text-400 text-gray-200')}>
          {totalEntries} Entries
        </Text>
      </View>
      <View
        style={applyStyles({
          width: '30%',
          alignItems: 'center',
        })}>
        <Text
          style={applyStyles(
            'pb-4 text-xs text-400 text-gray-200 text-uppercase',
          )}>
          Total Cost
        </Text>
        <Text style={applyStyles('text-xs text-700 text-gray-300')}>
          {amountWithCurrency(totalAmount)}
        </Text>
      </View>
      <View
        style={applyStyles('items-end', {
          width: '30%',
        })}>
        <Text
          style={applyStyles(
            'pb-4 text-xs text-400 text-gray-200 text-uppercase',
          )}>
          Amount Paid
        </Text>
        <Text style={applyStyles('text-xs text-700 text-green-200')}>
          {amountWithCurrency(amountPaid)}
        </Text>
      </View>
    </View>
  );
};
