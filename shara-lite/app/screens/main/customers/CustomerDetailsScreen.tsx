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
    return (customer.receipts
      ?.filtered('is_deleted = false')
      .sorted('created_at', true) as unknown) as IReceipt[];
  }, [customer]);

  return (
    <CustomerContext.Provider value={customer}>
      <TransactionDetails
        dueDate={customer?.due_date}
        transactions={filteredReceipts}
        {...transactionDetailsProps}
      />
    </CustomerContext.Provider>
  );
};

export default CustomerDetailsScreen;
