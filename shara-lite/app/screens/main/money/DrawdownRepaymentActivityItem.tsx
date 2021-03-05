import {Icon} from '@/components/Icon';
import {amountWithCurrency} from '@/helpers/utils';
import {IDrawdown} from '@/models/Drawdown';
import {IDrawdownRepayment} from '@/models/DrawdownRepayment';
import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import {format, formatDistanceToNowStrict} from 'date-fns';
import React from 'react';
import {Text, View} from 'react-native';
import Markdown from 'react-native-markdown-display';

type Props = {
  data: IDrawdownRepayment;
};

const strings = getI18nService().strings;

const markdownStyle = {
  body: applyStyles('text-gray-300 text-400 text-base'),
  em: applyStyles('text-500', {
    fontWeight: '500',
    fontStyle: 'normal',
  }),
};

export const DrawdownRepaymentActivityItem = (props: Props) => {
  const {data} = props;
  const {created_at, amount} = data;
  return (
    <View
      style={applyStyles('px-16 py-8 flex-row items-center justify-between', {
        borderBottomWidth: 1.2,
        borderBottomColor: colors['gray-20'],
      })}>
      <View style={applyStyles('flex-row items-center', {width: '66%'})}>
        <Icon
          size={18}
          type="feathericons"
          name={'arrow-up'}
          color={colors['green-200']}
        />
        <View style={applyStyles('pl-8')}>
          <Markdown style={markdownStyle}>
            {strings('drawdown.repayment_item_text', {
              amount: amountWithCurrency(amount),
              date: format(created_at ?? new Date(), 'dd MMM, yyyy'),
            })}
          </Markdown>
        </View>
      </View>
      <View style={applyStyles('items-end', {width: '30%'})}>
        <Text style={applyStyles('pb-4 text-700 text-xs text-green-200')}>
          {amountWithCurrency(amount)}
        </Text>
        <Text
          style={applyStyles('text-400 text-uppercase text-xxs text-gray-100')}>
          {created_at &&
            formatDistanceToNowStrict(created_at, {
              addSuffix: true,
            })}
        </Text>
      </View>
    </View>
  );
};
