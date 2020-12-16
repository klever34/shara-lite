import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React from 'react';
import {Text, View, ViewStyle} from 'react-native';
import Touchable from './Touchable';

const TransactionListItem = ({
  style,
  onPress,
  transaction,
}: {
  style?: ViewStyle;
  transaction: IReceipt;
  onPress?: () => void;
}) => {
  const {getReceiptAmounts} = useReceipt();
  const {creditAmountLeft, totalAmountPaid} = getReceiptAmounts(transaction);

  return (
    <Touchable onPress={onPress ? onPress : undefined}>
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
          {!!totalAmountPaid && (
            <Text
              style={applyStyles(
                'text-xs text-700 text-gray-300 text-uppercase',
              )}>
              {amountWithCurrency(totalAmountPaid)}
            </Text>
          )}
        </View>
        <View
          style={applyStyles('p-16 bg-white justify-center items-end', {
            width: '30%',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          })}>
          {!!creditAmountLeft && (
            <Text
              style={applyStyles(
                'text-xs text-700 text-red-100 text-uppercase',
              )}>
              {amountWithCurrency(creditAmountLeft)}
            </Text>
          )}
        </View>
      </View>
    </Touchable>
  );
};

export default TransactionListItem;
