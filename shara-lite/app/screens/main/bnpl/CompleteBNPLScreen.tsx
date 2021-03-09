import {Button} from '@/components';
import {Icon} from '@/components/Icon';
import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors, dimensions} from '@/styles';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {BNPLTransactionList} from './BNPLTransactionList';

const strings = getI18nService().strings;

const data = [
  {
    _id: 1,
    customer: {name: 'Jordan Solomon'},
    status: 'complete',
    amount: 20000,
    payments: [],
  },
];

export const CompleteBNPLScreen = () => {
  const navigation = useAppNavigation();

  const handleRecordTransaction = useCallback(() => {
    navigation.navigate('BNPLRecordTransactionScreen');
  }, [navigation]);

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      <View style={applyStyles('bg-gray-10 py-16 px-24')}>
        <View style={applyStyles('flex-row items-center justify-between')}>
          <Text style={applyStyles('text-gray-300')}>
            {strings('bnpl.total_completed_text')}
          </Text>
          <Text style={applyStyles('text-gray-300')}>
            {amountWithCurrency(0)}
          </Text>
        </View>
      </View>
      <View style={applyStyles('pt-16')}>
        <Text style={applyStyles('px-24 pb-8 text-uppercase text-gray-100')}>
          {strings('bnpl.clients_text')}
        </Text>
        <BNPLTransactionList data={data} />
      </View>
      <Button
        onPress={handleRecordTransaction}
        style={applyStyles('absolute bottom-16 rounded-32', {
          left: (dimensions.fullWidth - 200) / 2,
          width: 200,
        })}>
        <View style={applyStyles('flex-row items-center')}>
          <Icon
            size={18}
            name="plus"
            color={colors.white}
            type="material-community-icons"
          />
          <Text style={applyStyles('pl-8 text-uppercase text-white')}>
            {strings('bnpl.new_transaction_text')}
          </Text>
        </View>
      </Button>
    </View>
  );
};
