import {applyStyles} from '@/styles';
import React from 'react';
import {Text} from '@/components';
import {View, ViewStyle} from 'react-native';
//Todo: Work on translation
import {getI18nService} from '@/services';
const strings = getI18nService().strings;
const TransactionListHeader = ({style}: {style?: ViewStyle}) => {
  return (
    <View style={applyStyles('mb-8 flex-row flex-wrap', style)}>
      <View style={applyStyles({width: '40%'})}>
        <Text
          style={applyStyles('text-xxs text-700 text-gray-200 text-uppercase')}>
          Record
        </Text>
      </View>
      <View
        style={applyStyles({
          width: '30%',
          alignItems: 'center',
        })}>
        <Text
          style={applyStyles('text-xxs text-700 text-gray-200 text-uppercase')}>
          {strings('report.report_list_header.total_cost_text')}
        </Text>
      </View>
      <View
        style={applyStyles('items-end', {
          width: '30%',
        })}>
        <Text
          style={applyStyles('text-xxs text-700 text-gray-200 text-uppercase')}>
          {strings('report.report_list_header.amount_paid_text')}
        </Text>
      </View>
    </View>
  );
};

export default TransactionListHeader;
