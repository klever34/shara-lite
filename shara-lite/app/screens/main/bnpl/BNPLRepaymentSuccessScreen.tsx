import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {RouteProp} from '@react-navigation/core';
import React from 'react';
import {MainStackParamList} from '..';
import {BNPLSuccess} from './BNPLSuccess';

const strings = getI18nService().strings;

type BNPLRepaymentSuccessScreenProps = {
  route: RouteProp<MainStackParamList, 'BNPLRepaymentSuccessScreen'>;
};

export const BNPLRepaymentSuccessScreen = (
  props: BNPLRepaymentSuccessScreenProps,
) => {
  const {route} = props;
  const {transaction} = route.params;

  return (
    <BNPLSuccess
      captions={{
        heading: strings('bnpl.client.repayment.success.heading'),
        payment: strings('bnpl.client.repayment.success.outstanding', {
          amount: amountWithCurrency(transaction.credit_amount),
          days: 56,
        }),
        outstanding: strings('bnpl.client.repayment.success.payment', {
          amount: amountWithCurrency(0),
        }),
      }}
      {...route.params}
    />
  );
};
