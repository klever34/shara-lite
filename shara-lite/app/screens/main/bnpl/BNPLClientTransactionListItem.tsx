import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {Text, View} from 'react-native';

export const BNPLClientTransactionListItem = ({
  item,
  onPress,
}: {
  item: any;
  onPress(): void;
}) => {
  const {week, status, upcoming_status, amount, date} = item;
  const isPaid = status === 'paid';
  const isNotPaid = status === 'upcoming' && upcoming_status === 'not paid';
  const pillText = isPaid ? 'Paid' : isNotPaid ? 'Not paid' : 'Past due';
  const pillBgColor = isPaid
    ? 'bg-green-200'
    : isNotPaid
    ? 'bg-gray-20'
    : 'bg-red-100';
  const pillTextColor = isNotPaid ? 'text-gray-100' : undefined;

  return (
    <Touchable>
      <View style={applyStyles('flex-row px-24 pt-16 justify-between')}>
        <View
          style={applyStyles(
            'pb-18 flex-1 flex-row items-center border-b-1 justify-between',
            {
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <View>
            <Text style={applyStyles('pb-8 text-gray-300 text-gray-300')}>
              {week}
            </Text>
            <Text style={applyStyles('text-gray-100')}>{date}</Text>
          </View>
          <View>
            <Text style={applyStyles('pb-8 text-right text-gray-300')}>
              {amountWithCurrency(amount)}
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
