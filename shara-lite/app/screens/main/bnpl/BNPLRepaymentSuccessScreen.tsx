import {amountWithCurrency} from '@/helpers/utils';
import {getAuthService, getI18nService} from '@/services';
import {RouteProp} from '@react-navigation/core';
import React from 'react';
import {MainStackParamList} from '..';
import {BNPLSuccess} from './BNPLSuccess';
import Config from 'react-native-config';
import format from 'date-fns/format';
import {useBNPLDrawdown} from '@/services/bnpl-drawdown';
import {ObjectId} from 'bson';

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

  const {getBNPLDrawdown} = useBNPLDrawdown();
  const bnplDrawdown =
    drawdown._id &&
    getBNPLDrawdown({
      bnplDrawdownId: new ObjectId(drawdown._id),
    });

  const user = getAuthService().getUser();
  const businessInfo = getAuthService().getBusinessInfo();

  const activeRepayments = bnplDrawdown?.bnpl_repayments
    ?.filtered('status != "complete"')
    .sorted('batch_no', false);
  const activeRepaymentsLength = activeRepayments?.length;
  const remainingDays =
    activeRepayments && drawdown
      ? (drawdown?.repayment_period ?? 8) *
        (activeRepaymentsLength && activeRepaymentsLength < 8
          ? activeRepaymentsLength
          : 7)
      : 56;
  const nextRepayment = activeRepayments && activeRepayments[0];
  const paymentLink =
    businessInfo.slug &&
    `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
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
    credit_amount: amountWithCurrency(receiptData?.credit_amount),
  })}  ${strings('bnpl.next_repayment', {
    date: format(
      nextRepayment?.due_at ? new Date(nextRepayment?.due_at) : new Date(),
      'dd MMM yyyy',
    ),
    amount: amountWithCurrency(drawdown?.payment_frequency_amount),
  })}\n${
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
          days: remainingDays,
        }),
        outstanding: strings('bnpl.client.repayment.success.payment', {
          amount: amountWithCurrency(amount),
        }),
      }}
      {...route.params}
    />
  );
};
