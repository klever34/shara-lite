import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import React, {useCallback} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type TransactionListItemProps = {
  style?: ViewStyle;
  receipt?: IReceipt;
  onPress?: () => void;
};

const markdownStyle = {
  body: applyStyles('text-gray-300 text-400 text-base'),
  em: applyStyles('text-500', {
    fontWeight: '500',
    fontStyle: 'normal',
  }),
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
          <Markdown style={markdownStyle}>
            {`${
              customer
                ? strings('transaction.is_collection_with_customer_message', {
                    total_amount: amountWithCurrency(total_amount),
                    customer_name: customer.name,
                  })
                : strings('transaction.is_collection_message', {
                    total_amount: amountWithCurrency(total_amount),
                  })
            } ${
              customer?.balance
                ? strings('transaction.customer_balance_statement', {
                    polarity: customer.balance > 0 ? 'positive' : 'negative',
                    balance: amountWithCurrency(customer.balance),
                  })
                : ''
            }`}
          </Markdown>
        </View>
      );
    }
    if (isOutflow) {
      if (credit_amount && amount_paid === 0) {
        return (
          <View>
            {customer ? (
              <Markdown style={markdownStyle}>{`${strings(
                'transaction.customer_owes_statement',
                {
                  customer_name: customer.name,
                  credit_amount: amountWithCurrency(credit_amount),
                },
              )}`}</Markdown>
            ) : (
              <Markdown style={markdownStyle}>{`${strings(
                'transaction.you_were_paid_statement',
                {
                  amount_paid: amountWithCurrency(amount_paid),
                },
              )}`}</Markdown>
            )}
          </View>
        );
      }
      if (credit_amount) {
        return (
          <View>
            <Markdown style={markdownStyle}>{`${strings(
              'transaction.customer_paid_with_outstanding_statement',
              {
                customer_name: customer?.name ?? '',
                amount_paid: amountWithCurrency(amount_paid),
                credit_amount: amountWithCurrency(credit_amount),
              },
            )}`}</Markdown>
          </View>
        );
      }
    }
    return (
      <View>
        {customer ? (
          <Markdown style={markdownStyle}>{`${strings(
            'transaction.customer_paid_statement',
            {
              customer_name: customer.name,
              amount_paid: amountWithCurrency(amount_paid),
            },
          )}`}</Markdown>
        ) : (
          <Markdown style={markdownStyle}>{`${strings(
            'transaction.you_were_paid_statement',
            {
              amount_paid: amountWithCurrency(amount_paid),
            },
          )}`}</Markdown>
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
