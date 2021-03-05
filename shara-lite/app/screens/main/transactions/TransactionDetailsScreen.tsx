import TransactionDetails from '@/components/TransactionDetails';
import {ICustomer} from '@/models';
import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {MainStackParamList} from '..';

type TransactionDetailsScreenProps = {
  route: RouteProp<MainStackParamList, 'TransactionDetails'>;
};

const TransactionDetailsScreen = ({route}: TransactionDetailsScreenProps) => {
  const {transaction} = route.params;
  const customer = transaction?.customer as ICustomer;

  return (
    <TransactionDetails customer={customer} transactions={[transaction]} />
  );
};

export default TransactionDetailsScreen;
