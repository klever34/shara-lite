import {TransactionReview} from '@/components/TransactionReview';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {MainStackParamList} from '..';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type TransactionSuccessScreenProps = {
  route: RouteProp<MainStackParamList, 'TransactionSuccess'>;
};

export const TransactionSuccessScreen = (
  props: TransactionSuccessScreenProps,
) => {
  const {route} = props;
  const {onDone, transaction} = route.params;

  return (
    <SafeAreaView style={applyStyles('bg-white flex-1')}>
      <ScrollView persistentScrollbar style={applyStyles('flex-1')}>
        <TransactionReview
          onDone={onDone}
          heading={strings('success')}
          transaction={transaction}
          subheading={strings('transaction.transaction_success', {
            transaction_type: transaction.is_collection ? 'Collection' : 'Sale',
          })}
        />
        <View style={applyStyles({height: 50})} />
      </ScrollView>
    </SafeAreaView>
  );
};
