import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';

export const ReportListItem = ({
  style,
  transaction,
}: {
  style?: ViewStyle;
  transaction: IReceipt;
}) => {
  const {
    note,
    customer,
    amount_paid,
    total_amount,
    is_collection,
    transaction_date,
  } = transaction;
  return (
    <View
      style={applyStyles(
        'flex-row flex-wrap',
        {
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        },
        style,
      )}>
      <View
        style={applyStyles('py-8 px-16 bg-white', {
          width: '40%',
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
        })}>
        {!!customer?.name && (
          <Text
            style={applyStyles('pb-2 text-400 text-gray-300 text-capitalize')}>
            {customer?.name}
          </Text>
        )}
        {!!transaction_date && (
          <Text
            style={applyStyles(
              'pb-2 text-xs text-400 text-gray-100 text-uppercase',
            )}>
            {format(transaction_date, 'dd MMM, yyyy')} -{' '}
            {format(transaction_date, 'hh:mm a')}
          </Text>
        )}
        {!!note && (
          <Text style={applyStyles('text-700 text-gray-50 text-uppercase')}>
            {note}
          </Text>
        )}
      </View>
      <View
        style={applyStyles('py-8 px-16 bg-gray-10 justify-center', {
          width: '30%',
        })}>
        {!is_collection && (
          <Text
            style={applyStyles(
              'text-xs text-700 text-gray-300 text-uppercase',
            )}>
            {amountWithCurrency(total_amount)}
          </Text>
        )}
      </View>
      <View
        style={applyStyles('py-8 px-16 bg-white justify-center items-end', {
          width: '30%',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
        })}>
        {!!amount_paid && (
          <Text
            style={applyStyles(
              'text-xs text-700 text-green-200 text-uppercase',
            )}>
            {amountWithCurrency(amount_paid)}
          </Text>
        )}
      </View>
    </View>
  );
};
