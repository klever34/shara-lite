import {getI18nService} from '@/services';
import React from 'react';
import {BNPLClientDetailsList} from './BNPLClientDetailsList';

const data = [
  {
    _id: 1,
    customer: {name: 'Jordan Solomon'},
    status: 'complete',
    amount: 20000,
    payments: [],
  },
];

const strings = getI18nService().strings;

export const BNPLClientUpcomingScreen = () => {
  return (
    <BNPLClientDetailsList
      data={data}
      header={{
        caption: strings('bnpl.payment_left.one', {amount: 0}),
        amount: 0,
      }}
    />
  );
};
