import {getI18nService} from '@/services';
import React from 'react';
import {BNPLClientDetailsList} from './BNPLClientDetailsList';

const data = [
  {
    _id: 1,
    week: 'Week 3',
    status: 'paid',
    amount: 183.33,
    date: '05 March, 2021',
  },
];

const strings = getI18nService().strings;

export const BNPLClientPaidScreen = () => {
  return (
    <BNPLClientDetailsList
      data={data}
      header={{
        caption: strings('bnpl.payment_made_text.one', {amount: 0}),
        amount: 0,
      }}
    />
  );
};
