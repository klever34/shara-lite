import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {RouteProp} from '@react-navigation/core';
import React from 'react';
import {MainStackParamList} from '..';
import {BNPLSuccess} from './BNPLSuccess';

const strings = getI18nService().strings;

type BNPLTransactionSuccessScreenProps = {
  route: RouteProp<MainStackParamList, 'BNPLTransactionSuccessScreen'>;
};

export const BNPLTransactionSuccessScreen = (
  props: BNPLTransactionSuccessScreenProps,
) => {
  const {route} = props;
  const {transaction} = route.params;
  const {receiptData, drawdown} = transaction;

  return (
    <BNPLSuccess
      captions={{
        heading: strings('bnpl.success.heading'),
        outstanding: strings('bnpl.success.outstanding', {
          amount: amountWithCurrency(receiptData?.credit_amount),
        }),
        payment: strings('bnpl.success.payment', {
          amount: amountWithCurrency(drawdown.repayment_amount),
          days: 56,
        }),
      }}
      {...route.params}
    />
  );
};
