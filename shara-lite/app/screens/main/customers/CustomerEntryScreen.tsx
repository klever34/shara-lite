import React from 'react';
import {Header} from '@/components';
import {applyStyles} from '@/styles';
import {View} from 'react-native';
import {
  TransactionEntryContextProps,
  TransactionEntryView,
  withTransactionEntry,
} from '@/components/TransactionEntryView';
import {RouteProp} from '@react-navigation/native';
import {CustomersStackParamList} from '@/screens/main/customers/index';
import {MainStackParamList} from '@/screens/main';

export type CustomerEntryScreenParams = {
  onEntrySave: (context: TransactionEntryContextProps) => void;
};

export type CustomerEntryScreenProps = {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerEntry'
  >;
};

export const CustomerEntryScreen = withTransactionEntry(
  ({route}: CustomerEntryScreenProps) => {
    const {onEntrySave} = route.params;
    return (
      <View style={applyStyles('h-screen')}>
        <Header iconLeft={{iconName: 'x'}} title=" " />
        <TransactionEntryView
          showLastTransactions={false}
          actionButtons={[
            {
              label: 'Save',
              style: applyStyles('bg-green-200'),
              textStyle: applyStyles('font-bold text-white'),
              onPress: onEntrySave,
            },
          ]}
        />
      </View>
    );
  },
);
