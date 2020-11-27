import TransactionDetails from '@/components/TransactionDetails';
import {IReceipt} from '@/models/Receipt';
import {CustomersStackParamList} from '@/screens/main/customers';
import {CustomerContext} from '@/services/customer';
import {RouteProp} from '@react-navigation/native';
import React, {useMemo} from 'react';
import {MainStackParamList} from '..';

type CustomerDetailsProps = {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerDetails'
  >;
};

const CustomerDetails = ({route}: CustomerDetailsProps) => {
  const {customer} = route.params;
  const credit = customer?.credits && customer.credits[0];
  const creditDueDate = credit?.due_date;

  const creditAmountLeft = customer?.credits?.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );

  const filteredReceipts = useMemo(() => {
    return (customer.receipts?.sorted(
      'created_at',
      true,
    ) as unknown) as IReceipt[];
  }, [customer.receipts]);

  return (
    <CustomerContext.Provider value={customer}>
      <TransactionDetails
        customer={customer}
        dueDate={creditDueDate}
        transactions={filteredReceipts}
        creditAmount={creditAmountLeft}
      />
    </CustomerContext.Provider>
  );
};

export default CustomerDetails;
