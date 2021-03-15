import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IBNPLRepayment} from '@/models/BNPLRepayment';
import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import format from 'date-fns/format';
import React from 'react';
import {Text, View} from 'react-native';

const strings = getI18nService().strings;

export const BNPLClientTransactionListItem = ({
  item,
}: {
  item: IBNPLRepayment;
}) => {
  const {batch_no, status, repayment_amount, due_at} = item;
  const isPaid = status === 'complete';
  const isOverdue = status === 'overdue';
  const isNotPaid = status === 'active' || status === 'pending';
  const pillText = isPaid
    ? strings('bnpl.client.paid')
    : isOverdue
    ? strings('bnpl.client.past_due')
    : strings('bnpl.client.not_paid');
  const pillBgColor = isPaid
    ? 'bg-green-200'
    : isOverdue
    ? 'bg-red-100'
    : 'bg-gray-20';
  const pillTextColor = isNotPaid ? 'text-gray-100' : 'text-white';

  return (
    <Touchable>
      <View style={applyStyles('flex-row pt-16 justify-between')}>
        <View
          style={applyStyles(
            'pb-18 px-24 flex-1 flex-row items-center border-b-1 justify-between',
            {
              borderBottomColor: isOverdue
                ? colors['red-100']
                : colors['gray-20'],
            },
          )}>
          <View>
            <Text
              style={applyStyles(
                `pb-8 text-gray-300 ${
                  isOverdue ? 'text-red-100' : 'text-gray-300'
                }`,
              )}>
              Week {batch_no}
            </Text>
            <Text
              style={applyStyles(
                `${isOverdue ? 'text-red-100' : 'text-gray-100'}`,
              )}>
              {format(due_at ? new Date(due_at) : new Date(), 'dd MMM yyyy')}
            </Text>
          </View>
          <View>
            <Text
              style={applyStyles(
                `pb-8 text-right ${
                  isOverdue ? 'text-red-100' : 'text-gray-300'
                }`,
              )}>
              {amountWithCurrency(repayment_amount)}
            </Text>
            <View style={applyStyles(`py-4 px-12 rounded-16 ${pillBgColor}`)}>
              <Text style={applyStyles(`text-white ${pillTextColor}`)}>
                {pillText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Touchable>
  );
};
