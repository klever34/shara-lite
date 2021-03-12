import EmptyState from '@/components/EmptyState';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback} from 'react';
import {FlatList, Text, View} from 'react-native';

type BNPLTransactionListProps = {
  data: Realm.Results<IBNPLDrawdown & Realm.Object>;
};

const strings = getI18nService().strings;

const BNPLTransactionListItem = ({
  item,
  onPress,
}: {
  item: IBNPLDrawdown;
  onPress(): void;
}) => {
  const {
    customer,
    repayment_amount,
    status,
    bnpl_repayments,
    payment_frequency_amount,
  } = item;
  const isComplete = status === 'complete';
  console.log(bnpl_repayments?.length);
  const noOfPayments =
    bnpl_repayments?.filtered('status != "complete"').length ?? 8;
  const pillText = isComplete
    ? strings('bnpl.completed_text')
    : noOfPayments > 1
    ? strings('bnpl.payment_left_text.other', {amount: noOfPayments})
    : strings('bnpl.payment_left_text.one', {amount: noOfPayments});
  const pillBgColor = isComplete ? 'bg-green-200' : 'bg-blue-100';

  return (
    <Touchable onPress={onPress}>
      <View style={applyStyles('flex-row px-24 pt-16 justify-between')}>
        <PlaceholderImage
          text={customer?.name ?? ''}
          style={applyStyles('mr-16', {width: 50, height: 50})}
          image={customer?.image ? {uri: customer?.image} : undefined}
        />
        <View
          style={applyStyles(
            'pb-18 flex-1 flex-row items-center border-b-1 justify-between',
            {
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <View>
            <Text style={applyStyles('pb-8 text-gray-300 text-gray-300')}>
              {customer?.name}
            </Text>
            <Text style={applyStyles('text-gray-100')}>
              {strings('bnpl.repayment_per_week', {
                amount: amountWithCurrency(payment_frequency_amount),
              })}
            </Text>
          </View>
          <View>
            <Text style={applyStyles('pb-8 text-right text-gray-300')}>
              {amountWithCurrency(repayment_amount)}
            </Text>
            <View style={applyStyles(`py-4 px-12 rounded-16 ${pillBgColor}`)}>
              <Text style={applyStyles('text-white')}>{pillText}</Text>
            </View>
          </View>
        </View>
      </View>
    </Touchable>
  );
};

export const BNPLTransactionList = (props: BNPLTransactionListProps) => {
  const {data} = props;
  const navigation = useAppNavigation();

  const handlePressListItem = useCallback(
    (item: IBNPLDrawdown) => {
      navigation.navigate('BNPLClientScreen', {data: item});
    },
    [navigation],
  );

  const renderListItem = useCallback(
    ({item}) => (
      <BNPLTransactionListItem
        item={item}
        onPress={() => handlePressListItem(item)}
      />
    ),
    [handlePressListItem],
  );

  return (
    <FlatList
      data={data}
      initialNumToRender={10}
      renderItem={renderListItem}
      keyExtractor={(item) => `${item?._id?.toString()}`}
      ListEmptyComponent={
        <EmptyState
          text={strings('bnpl.empty_state')}
          source={require('@/assets/images/emblem.png')}
          imageStyle={applyStyles('pb-32', {width: 60, height: 60})}
        />
      }
      contentContainerStyle={
        !data.length ? applyStyles('flex-1') : applyStyles({paddingBottom: 180})
      }
    />
  );
};
