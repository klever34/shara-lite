import {TransactionReview} from '@/components/TransactionReview';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {MainStackParamList} from '..';

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
          heading="Success"
          transaction={transaction}
          subheading={`${
            transaction.is_collection ? 'Collection' : 'Sale'
          } has been recorded Succesfully`}
        />
        <View style={applyStyles({height: 50})} />
      </ScrollView>
    </SafeAreaView>
  );
};
