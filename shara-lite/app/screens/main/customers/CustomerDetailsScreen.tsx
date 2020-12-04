import TransactionDetails from '@/components/TransactionDetails';
import {IReceipt} from '@/models/Receipt';
import {CustomersStackParamList} from '@/screens/main/customers';
import {CustomerContext} from '@/services/customer';
import {RouteProp} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {MainStackParamList} from '..';

type CustomerDetailsScreenProps = {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerDetails'
  >;
};

const CustomerDetailsScreen = ({route}: CustomerDetailsScreenProps) => {
  const transactionDetailsProps = route.params;
  const {customer} = transactionDetailsProps;

  const filteredReceipts = useMemo(() => {
    return (customer?.receipts?.sorted(
      'created_at',
      true,
    ) as unknown) as IReceipt[];
  }, [customer]);

  const isPaid = filteredReceipts?.every((item) => item.isPaid);

  return (
    <CustomerContext.Provider value={customer}>
      <TransactionDetails
        isPaid={isPaid}
        dueDate={customer?.dueDate}
        transactions={filteredReceipts}
        creditAmount={customer?.remainingCreditAmount}
        {...transactionDetailsProps}
      />
    </CustomerContext.Provider>
  );
};

export default CustomerDetailsScreen;
