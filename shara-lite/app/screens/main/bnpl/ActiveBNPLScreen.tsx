import {Button} from '@/components';
import {Icon} from '@/components/Icon';
import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {useBNPLApproval} from '@/services/bnpl-approval';
import {useBNPLDrawdown} from '@/services/bnpl-drawdown';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors, dimensions} from '@/styles';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {BNPLTransactionList} from './BNPLTransactionList';

const strings = getI18nService().strings;

export const ActiveBNPLScreen = () => {
  const navigation = useAppNavigation();
  const {getBNPLApproval} = useBNPLApproval();
  const {getBNPLDrawdowns} = useBNPLDrawdown();

  const bnplDrawdowns = getBNPLDrawdowns().filtered('status != "complete"');
  const amount_available = getBNPLApproval()?.amount_available;
  const amount_drawn = getBNPLApproval()?.amount_drawn;

  const handleRecordTransaction = useCallback(() => {
    navigation.navigate('BNPLRecordTransactionScreen');
  }, [navigation]);

  return (
    <View style={applyStyles('flex-1 bg-white')}>
      <View style={applyStyles('bg-gray-10 py-16 px-24')}>
        <View style={applyStyles('flex-row items-center justify-between')}>
          <Text style={applyStyles('text-gray-300')}>
            {strings('bnpl.amount_available_text')}
          </Text>
          <Text style={applyStyles('text-gray-300 text-700')}>
            {amountWithCurrency(amount_available)}
          </Text>
        </View>
        <View
          style={applyStyles('pb-16 flex-row items-center justify-between')}>
          <Text style={applyStyles('text-gray-300')}>
            {strings('bnpl.amount_used_text')}
          </Text>
          <Text style={applyStyles('text-gray-300 text-700')}>
            {amountWithCurrency(amount_drawn)}
          </Text>
        </View>
      </View>
      <View style={applyStyles('pt-16 flex-1')}>
        {!!bnplDrawdowns.length && (
          <Text style={applyStyles('px-24 pb-8 text-uppercase text-gray-100')}>
            {strings('bnpl.clients_text')}
          </Text>
        )}
        <BNPLTransactionList
          data={bnplDrawdowns}
          emptyState={{
            text: strings('bnpl.active_empty_state'),
          }}
        />
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
