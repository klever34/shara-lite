import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import React, {useCallback} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type TransactionListItemProps = {
  style?: ViewStyle;
  receipt?: IReceipt;
  onPress?: () => void;
};

export const TransactionListItem = ({
  style,
  receipt,
  onPress,
}: TransactionListItemProps) => {
  const {
    note,
    customer,
    isInflow,
    isOutflow,
    amount_paid,
    total_amount,
    credit_amount,
    is_collection,
    transaction_date,
  } = receipt ?? {};

  const renderTransactionText = useCallback(() => {
    if (is_collection) {
      return (
        <View>
          <Text style={applyStyles('text-gray-300 text-400 text-base')}>
            {strings('transaction.you_collected')}{' '}
            <Text style={applyStyles('text-700')}>
              {amountWithCurrency(total_amount)}
            </Text>
            <Text style={applyStyles('text-500')}>
              {customer &&
                strings('transaction.collected_from_who', {
                  customer_name: customer.name,
                })}
            </Text>
            {customer?.balance
              ? strings('transaction.customer_balance_statement', {
                  polarity: customer.balance > 0 ? 'positive' : 'negative',
                  balance: customer.balance,
                })
              : ''}
          </Text>
        </View>
      );
    }
    if (isOutflow) {
      if (credit_amount && amount_paid === 0) {
        return (
          <View>
            {customer ? (
              <Text style={applyStyles('text-gray-300 text-400 text-base')}>
                <Text style={applyStyles('text-500')}>{customer.name}</Text>{' '}
                {strings('owe', {count: 2})}{' '}
                <Text style={applyStyles('text-700')}>
                  {amountWithCurrency(credit_amount)}
                </Text>
              </Text>
            ) : (
              <Text style={applyStyles('text-gray-300 text-400 text-base')}>
                {strings('transaction.you_were_paid')}{' '}
                <Text style={applyStyles('text-700')}>
                  {amountWithCurrency(amount_paid)}
                </Text>{' '}
                ({strings('customers.no_customer_selected')})
              </Text>
            )}
          </View>
        );
      }
      if (credit_amount) {
        return (
          <View>
            <Text style={applyStyles('text-gray-300 text-400 text-base')}>
              <Text style={applyStyles('text-500')}>
                {customer && `${customer.name}`}
              </Text>{' '}
              {strings('transaction.paid_you')}{' '}
              <Text style={applyStyles('text-700')}>
                {amountWithCurrency(amount_paid)}
              </Text>{' '}
              {strings('and')}{' '}
              <Text style={applyStyles('text-700')}>
                {amountWithCurrency(credit_amount)}
              </Text>{' '}
              {strings('transaction.is_outstanding')}
            </Text>
          </View>
        );
      }
    }
    return (
      <View>
        {customer ? (
          <Text style={applyStyles('text-gray-300 text-400 text-base')}>
            <Text style={applyStyles('text-500')}>{customer.name}</Text>{' '}
            {strings('transaction.paid_you')}{' '}
            <Text style={applyStyles('text-700')}>
              {amountWithCurrency(amount_paid)}
            </Text>
          </Text>
        ) : (
          <Text style={applyStyles('text-gray-300 text-400 text-base')}>
            {strings('transaction.you_were_paid')}{' '}
            <Text style={applyStyles('text-700')}>
              {amountWithCurrency(amount_paid)}
            </Text>{' '}
            ({strings('customers.no_customer_selected')})
          </Text>
        )}
      </View>
    );
  }, [
    credit_amount,
    amount_paid,
    customer,
    isOutflow,
    is_collection,
    total_amount,
  ]);

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
          <View style={applyStyles('pl-4')}>
            <View>{renderTransactionText()}</View>
            {!!note && (
              <Text style={applyStyles('text-gray-100 text-xxs pt-4')}>
                {note}
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
                  isInflow ? 'text-green-200' : 'text-red-200'
                }`,
              )}>
              {amountWithCurrency(isInflow ? total_amount : credit_amount)}
            </Text>
          </View>
          <Text
            style={applyStyles(
              'text-400 text-uppercase text-xxs text-gray-100',
            )}>
            {transaction_date &&
              formatDistanceToNowStrict(transaction_date, {
                addSuffix: true,
              })}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};
