import {TransactionReview} from '@/components/TransactionReview';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView} from 'react-native';
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
      <TransactionReview
        heading="Success"
        onDone={onDone}
        transaction={transaction}
        subheading="Sale has been recorded Succesfully"
      />
    </SafeAreaView>
  );
};
