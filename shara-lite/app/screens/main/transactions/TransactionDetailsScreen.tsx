import TransactionDetails from '@/components/TransactionDetails';
import {ICustomer} from '@/models';
import {useAppNavigation} from '@/services/navigation';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {MainStackParamList} from '..';

type TransactionDetailsScreenProps = {
  route: RouteProp<MainStackParamList, 'TransactionDetails'>;
};

const TransactionDetailsScreen = ({route}: TransactionDetailsScreenProps) => {
  const {transaction} = route.params;
  const customer = transaction?.customer;
  const creditDueDate = transaction?.dueDate;
  const navigation = useAppNavigation();

  const creditAmountLeft = transaction?.credits
    ?.filter((item) => !item.fulfilled)
    .reduce((acc, item) => acc + item.amount_left, 0);

  const handleViewAllTransactins = useCallback(
    (item?: ICustomer) => {
      navigation.navigate('CustomerDetails', {customer: item});
    },
    [navigation],
  );

  return (
    <TransactionDetails
      customer={customer}
      dueDate={creditDueDate}
      showActionButtons={false}
      isPaid={transaction.isPaid}
      transactions={[transaction]}
      creditAmount={creditAmountLeft}
      onViewAllTransactions={handleViewAllTransactins}
    />
  );
};

export default TransactionDetailsScreen;
