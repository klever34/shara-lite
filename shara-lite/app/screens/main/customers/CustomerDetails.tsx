import {Button, DatePicker} from '@/components';
import CustomerDetailsHeader from '@/components/CustomerDetailsHeader';
import {Icon} from '@/components/Icon';
import PaymentReminderImage from '@/components/PaymentReminderImage';
import Touchable from '@/components/Touchable';
import TransactionDetails from '@/components/TransactionDetails';
import TransactionListHeader from '@/components/TransactionListHeader';
import TransactionListItem from '@/components/TransactionListItem';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {CustomersStackParamList} from '@/screens/main/customers';
import {getAnalyticsService, getAuthService} from '@/services';
import {CustomerContext} from '@/services/customer';
import {useAppNavigation} from '@/services/navigation';
import {ShareHookProps, useShare} from '@/services/share';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {format} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {Dimensions, FlatList, SafeAreaView, Text, View} from 'react-native';
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
