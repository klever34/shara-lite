import {getI18nService} from '@/services';
import React from 'react';
import {BNPLClientDetailsList} from './BNPLClientDetailsList';

const data = [
  {
    _id: 1,
    week: 'Week 4',
    upcoming_status: 'past due',
    status: 'upcoming',
    amount: 183.33,
    date: '05 March, 2021',
  },
  {
    _id: 2,
    week: 'Week 5',
    upcoming_status: 'not paid',
    status: 'upcoming',
    amount: 183.33,
    date: '05 March, 2021',
  },
];

const strings = getI18nService().strings;

export const BNPLClientUpcomingScreen = () => {
  return (
    <BNPLClientDetailsList
      data={data}
      header={{
        caption: strings('bnpl.payment_left_text.one', {amount: 0}),
        amount: 0,
      }}
    />
  );
};
