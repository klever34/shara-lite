import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import React, {useCallback} from 'react';
import {Text, View, ViewStyle} from 'react-native';

export type TransactionListItemProps = {
  style?: ViewStyle;
  isHeader?: boolean;
  receipt?: IReceipt;
  onPress?: () => void;
  getReceiptItemLeftText?: (receipt?: IReceipt) => string;
  getReceiptItemRightText?: (receipt?: IReceipt) => string;
};

export const TransactionListItem = ({
  style,
  receipt,
  onPress,
}: TransactionListItemProps) => {
  const {getReceiptAmounts} = useReceipt();
  const {creditAmountLeft, totalAmountPaid} = getReceiptAmounts(receipt);

  const renderTransactionText = useCallback(() => {
    if (!receipt?.isPaid) {
      if (creditAmountLeft && totalAmountPaid === 0) {
        return (
          <View>
            <Text style={applyStyles('text-gray-300 text-400 text-base')}>
              Outstanding of{' '}
              <Text style={applyStyles('text-700')}>
                {amountWithCurrency(creditAmountLeft)}
              </Text>
              {receipt?.customer && ` to ${receipt.customer.name}`}
            </Text>
          </View>
        );
      }
      if (creditAmountLeft) {
        return (
          <View>
            <Text style={applyStyles('text-gray-300 text-400 text-base')}>
              Sale of{' '}
              <Text style={applyStyles('text-700')}>
                {amountWithCurrency(receipt?.total_amount)}
              </Text>
              {receipt?.customer && ` to ${receipt.customer.name}`}
              {`. Collected ${amountWithCurrency(
                totalAmountPaid,
              )} and outstanding of ${amountWithCurrency(creditAmountLeft)}`}
            </Text>
          </View>
        );
      }
    }
    return (
      <View>
        <Text style={applyStyles('text-gray-300 text-400 text-base')}>
          Sale of{' '}
          <Text style={applyStyles('text-700')}>
            {amountWithCurrency(receipt?.total_amount)}
          </Text>
          {receipt?.customer && ` to ${receipt.customer.name}`}
        </Text>
      </View>
    );
  }, [creditAmountLeft, receipt, totalAmountPaid]);

  return (
    <Touchable onPress={onPress ? onPress : undefined}>
      <View
        style={applyStyles(
          'px-16 py-8 flex-row items-center justify-between',
          {
            borderBottomWidth: 1.2,
            borderBottomColor: colors['gray-10'],
          },
          style,
        )}>
        <View style={applyStyles('flex-row items-center', {width: '66%'})}>
          <Icon
            size={18}
            type="feathericons"
            name={receipt?.isPaid ? 'arrow-up' : 'arrow-down'}
            color={receipt?.isPaid ? colors['green-200'] : colors['red-100']}
          />
          <View style={applyStyles('pl-4')}>
            <View>{renderTransactionText()}</View>
            {!!receipt?.note && (
              <Text style={applyStyles('text-gray-100 text-xxs pt-4')}>
                {receipt?.note}
              </Text>
            )}
          </View>
        </View>
        <View style={applyStyles('items-end', {width: '30%'})}>
          <View
            style={applyStyles('mb-2 py-4 px-8 bg-gray-10 rounded-16 center', {
              borderWidth: 1,
              borderColor: colors['gray-20'],
            })}>
            <Text
              style={applyStyles(
                `pb-4 text-700 text-xs ${
                  receipt?.isPaid ? 'text-green-200' : 'text-red-200'
                }`,
              )}>
              {amountWithCurrency(
                receipt?.isPaid ? receipt?.total_amount : creditAmountLeft,
              )}
            </Text>
          </View>
          <Text
            style={applyStyles(
              'text-400 text-uppercase text-xxs text-gray-100',
            )}>
            {receipt?.created_at &&
              formatDistanceToNowStrict(receipt?.created_at, {
                addSuffix: true,
              })}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
