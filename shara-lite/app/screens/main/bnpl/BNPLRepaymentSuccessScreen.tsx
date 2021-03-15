import {amountWithCurrency} from '@/helpers/utils';
import {getAuthService, getI18nService} from '@/services';
import {RouteProp} from '@react-navigation/core';
import React from 'react';
import {MainStackParamList} from '..';
import {BNPLSuccess} from './BNPLSuccess';
import Config from 'react-native-config';
import format from 'date-fns/format';

const strings = getI18nService().strings;

type BNPLRepaymentSuccessScreenProps = {
  route: RouteProp<MainStackParamList, 'BNPLRepaymentSuccessScreen'>;
};

export const BNPLRepaymentSuccessScreen = (
  props: BNPLRepaymentSuccessScreenProps,
) => {
  const {route} = props;
  const {transaction, amount} = route.params;
  const {drawdown, receiptData} = transaction;

  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();

  const activeRepayments = drawdown.bnpl_repayments
    ?.filtered('status != "completed"')
    .sorted('batch_no', false);
  const nextRepayment = activeRepayments && activeRepayments[0];
  const paymentLink =
    businessInfo.slug &&
    `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
      drawdown.customer?._id
        ? `?customer=${String(drawdown.customer?._id)}`
        : ''
    }`;
  const shareReceiptMessage = `${
    businessInfo.name || user?.firstname
      ? strings('bnpl.recent_purchase_message_from_business', {
          customer_name: drawdown.customer?.name ?? '',
          business_name: businessInfo.name || user?.firstname,
        })
      : strings('bnpl.recent_purchase_message', {
          customer_name: drawdown.customer?.name ?? '',
        })
  } ${strings('bnpl.you_paid_message', {
    amount: amountWithCurrency(receiptData?.amount_paid),
  })} ${strings('bnpl.you_owe_message', {
    credit_amount: amountWithCurrency(receiptData?.credit_amount),
  })}  ${strings('bnpl.next_repayment', {
    date: format(
      nextRepayment?.due_at ? new Date(nextRepayment?.due_at) : new Date(),
      'dd MMM yyyy',
    ),
    amount: amountWithCurrency(drawdown?.payment_frequency_amount),
  })} ${
    paymentLink
      ? strings('payment_link_message', {
          payment_link: paymentLink,
        })
      : ''
  }\n\n${strings('powered_by_shara')}`;

  return (
    <BNPLSuccess
      shareReceiptMessage={shareReceiptMessage}
      captions={{
        heading: strings('bnpl.client.repayment.success.heading'),
        payment: strings('bnpl.client.repayment.success.outstanding', {
          amount: amountWithCurrency(drawdown.amount_owed),
          days: 56,
        }),
        outstanding: strings('bnpl.client.repayment.success.payment', {
          amount: amountWithCurrency(amount),
        }),
      }}
      {...route.params}
    />
  );
};
