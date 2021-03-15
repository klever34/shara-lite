import {amountWithCurrency} from '@/helpers/utils';
import {IBNPLRepayment} from '@/models/BNPLRepayment';
import {getI18nService} from '@/services';
import {RouteProp} from '@react-navigation/core';
import React from 'react';
import {BNPLClientDetailsList} from './BNPLClientDetailsList';
import {BNPLClientTabParamList} from './BNPLClientScreen';

const strings = getI18nService().strings;

export const BNPLClientUpcomingScreen = (props: {
  route: RouteProp<BNPLClientTabParamList, 'Upcoming'>;
}) => {
  const {route} = props;
  const {data} = route.params;
  const repayments =
    data.bnpl_repayments
      ?.filtered('status != "complete"')
      .sorted('batch_no', false) ?? ({} as Realm.Results<IBNPLRepayment>);

  const repaymentsLeft = repayments.filtered('status != "complete"');

  const amountLeft = repaymentsLeft.sum('repayment_amount');

  return (
    <BNPLClientDetailsList
      drawdown={data}
      data={repayments}
      customer={data.customer}
      header={{
        caption:
          repaymentsLeft.length > 1
            ? strings('bnpl.payment_left_text.other', {
                amount: repaymentsLeft.length,
              })
            : strings('bnpl.payment_left_text.one', {
                amount: repaymentsLeft.length,
              }),
        amount: amountLeft ?? 0,
      }}
    />
  );
};
