import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {applyStyles, colors} from '@/styles';
import React from 'react';
import {View, ViewStyle} from 'react-native';
import {Text} from '@/components';

type Props = {
  totalAmount: number;
  amountPaid: number;
  totalEntries: number;
  style?: ViewStyle;
};

const i18Service = getI18nService();

export const ReportListHeader = ({
  style,
  amountPaid,
  totalEntries,
  totalAmount,
}: Props) => {
  return (
    <View
      style={applyStyles(
        'px-16 py-8 flex-row flex-wrap',
        {borderBottomWidth: 1.5, borderBottomColor: colors['gray-20']},
        style,
      )}>
      <View style={applyStyles({width: '40%'})}>
        <Text
          style={applyStyles(
            'pb-4 text-xs text-400 text-gray-200 text-uppercase',
          )}>
          {i18Service.strings('report.report_list_header.transactions_text')}
        </Text>
        <Text style={applyStyles('text-xs text-400 text-gray-200')}>
          {totalEntries}{' '}
          {i18Service.strings('report.report_list_header.total_entries_text')}
        </Text>
      </View>
      <View
        style={applyStyles({
          width: '30%',
          alignItems: 'center',
        })}>
        <Text
          style={applyStyles(
            'pb-4 text-xs text-400 text-gray-200 text-uppercase',
          )}>
          {i18Service.strings('report.report_list_header.total_cost_text')}
        </Text>
        <Text style={applyStyles('text-xs text-700 text-gray-300')}>
          {amountWithCurrency(totalAmount)}
        </Text>
      </View>
      <View
        style={applyStyles('items-end', {
          width: '30%',
        })}>
        <Text
          style={applyStyles(
            'pb-4 text-xs text-400 text-gray-200 text-uppercase',
          )}>
          {i18Service.strings('report.report_list_header.amount_paid_text')}
        </Text>
        <Text style={applyStyles('text-xs text-700 text-green-200')}>
          {amountWithCurrency(amountPaid)}
        </Text>
      </View>
    </View>
  );
};
