import {amountWithCurrency} from '@/helpers/utils';
import {getAuthService, getI18nService} from '@/services';
import {RouteProp} from '@react-navigation/core';
import React from 'react';
import {MainStackParamList} from '..';
import Config from 'react-native-config';
import {BNPLSuccess} from './BNPLSuccess';
import format from 'date-fns/format';

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

  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();
  const numberOfDays = (drawdown?.payment_frequency ?? 0) * 7

  const firstRepayment =
    drawdown?.bnpl_repayments && drawdown.bnpl_repayments[0];
  const paymentLink =
    businessInfo.slug &&
    `${Config.WEB_BASE_URL}/pay/bnpl/${businessInfo.slug}/${drawdown.api_id}${
      receiptData?.customer?._id
        ? `?customer=${String(receiptData?.customer?._id)}`
        : ''
    }`;
  const shareReceiptMessage = `${
    businessInfo.name || user?.firstname
      ? strings('bnpl.recent_purchase_message_from_business', {
          customer_name: receiptData?.customer?.name ?? '',
          business_name: businessInfo.name || user?.firstname,
        })
      : strings('bnpl.recent_purchase_message', {
          customer_name: receiptData?.customer?.name ?? '',
        })
  } ${strings('bnpl.you_paid_message', {
    amount: amountWithCurrency(receiptData?.amount_paid),
  })} ${strings('bnpl.you_owe_message', {
    credit_amount: amountWithCurrency(drawdown?.repayment_amount),
  })}  ${strings('bnpl.first_repayment', {
    date: format(
      firstRepayment?.due_at ? new Date(firstRepayment?.due_at) : new Date(),
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
        heading: strings('bnpl.success.heading'),
        outstanding: strings('bnpl.success.outstanding', {
          amount: amountWithCurrency(receiptData?.credit_amount),
        }),
        payment: strings('bnpl.success.payment', {
          amount: amountWithCurrency(drawdown.repayment_amount),
          days: numberOfDays,
        }),
      }}
      {...route.params}
    />
  );
};
