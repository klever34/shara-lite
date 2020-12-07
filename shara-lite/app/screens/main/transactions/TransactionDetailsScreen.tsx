import TransactionDetails from '@/components/TransactionDetails';
import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {MainStackParamList} from '..';

type TransactionDetailsScreenProps = {
  route: RouteProp<MainStackParamList, 'TransactionDetails'>;
};

const TransactionDetailsScreen = ({route}: TransactionDetailsScreenProps) => {
  const {transaction} = route.params;
  const customer = transaction?.customer;
  const creditDueDate = transaction?.dueDate;

  const creditAmountLeft = transaction?.credits
    ?.filter((item) => !item.fulfilled)
    .reduce((acc, item) => acc + item.amount_left, 0);

  return (
    <TransactionDetails
      customer={customer}
      dueDate={creditDueDate}
      isPaid={transaction.isPaid}
      transactions={[transaction]}
      creditAmount={creditAmountLeft}
    />
  );
};

export default TransactionDetailsScreen;
