import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React from 'react';
import {Text} from '@/components';
import {View, ViewStyle} from 'react-native';
import Touchable from './Touchable';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

const TransactionListItem = ({
  style,
  onPress,
  transaction,
}: {
  style?: ViewStyle;
  transaction: IReceipt;
  onPress?: () => void;
}) => {
  const {
    note,
    amount_paid,
    total_amount,
    credit_amount,
    is_collection,
    created_at,
  } = transaction;

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
          style={applyStyles('p-8 bg-white', {
            width: '40%',
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          })}>
          {!!created_at && (
            <Text
              style={applyStyles(
                'pb-2 text-xxs text-700 text-gray-100 text-uppercase',
              )}>
              {format(created_at, 'dd MMM yyyy')}
            </Text>
          )}
          {!!note && (
            <Text
              numberOfLines={3}
              style={applyStyles(
                'pb-2 text-xs text-700 text-gray-200 text-uppercase',
              )}>
              {note}
            </Text>
          )}
          {!is_collection && !!credit_amount && (
            <Text
              style={applyStyles(
                'text-700 text-xxs text-gray-100 text-uppercase',
              )}>
              {strings('balance')}: {amountWithCurrency(credit_amount)}
            </Text>
          )}
        </View>
        <View
          style={applyStyles('p-8 bg-gray-10 justify-center', {
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
          style={applyStyles('p-8 bg-white justify-center items-end', {
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
    </Touchable>
  );
};

export default TransactionListItem;
