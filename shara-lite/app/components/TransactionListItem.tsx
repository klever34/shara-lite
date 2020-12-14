import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';

const TransactionListItem = ({
  style,
  transaction,
}: {
  style?: ViewStyle;
  transaction: IReceipt;
}) => {
  return (
    <View
      style={applyStyles(
        'mb-4 flex-row flex-wrap rounded-8',
        {
          borderWidth: 1,
          borderColor: colors['gray-20'],
        },
        style,
      )}>
      <View
        style={applyStyles('p-16 bg-white', {
          width: '40%',
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        })}>
        {!!transaction.created_at && (
          <Text
            style={applyStyles(
              'pb-2 text-xxs text-700 text-gray-100 text-uppercase',
            )}>
            {format(transaction.created_at, 'dd MMM, yyyy')} -{' '}
            {format(transaction.created_at, 'hh:mm a')}
          </Text>
        )}
        {!!transaction.note && (
          <Text
            numberOfLines={1}
            style={applyStyles('text-700 text-gray-200 text-uppercase')}>
            {transaction.note}
          </Text>
        )}
      </View>
      <View
        style={applyStyles('p-16 bg-gray-10 justify-center', {
          width: '30%',
        })}>
        {transaction.isYouGave && (
          <Text
            style={applyStyles('text-xs text-700 text-red-200 text-uppercase')}>
            {amountWithCurrency(transaction.credit_amount)}
          </Text>
        )}
      </View>
      <View
        style={applyStyles('p-16 bg-white justify-center items-end', {
          width: '30%',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        })}>
        {transaction.isYouGot && (
          <Text
            style={applyStyles(
              'text-xs text-700 text-green-200 text-uppercase',
            )}>
            {amountWithCurrency(transaction.total_amount)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default TransactionListItem;
