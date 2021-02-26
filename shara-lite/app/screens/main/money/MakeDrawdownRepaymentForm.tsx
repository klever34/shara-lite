import {toNumber} from '@/components';
import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {format} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {AmountForm} from './AmountForm';

const strings = getI18nService().strings;

export const MakeDrawdownRepaymentForm = (props: any) => {
  const {wallet, closeModal} = props;
  const [amount, setAmount] = useState<string | undefined>();

  const transactionFee = useMemo(() => {
    const transactionPercentage =
      wallet?.drawdown_transaction_fee_percentage ?? 0;
    return (transactionPercentage / 100) * toNumber(amount ?? '0');
  }, [amount, wallet?.drawdown_transaction_fee_percentage]);

  const totalRepaymentAmount = useMemo(() => {
    if (amount) {
      return toNumber(amount) + transactionFee;
    }
  }, [amount, transactionFee]);

  const handleRepaymentAmountChange = useCallback((value: string) => {
    setAmount(value);
  }, []);
  return (
    <AmountForm
      header={{
        title: strings('drawdown.repayment'),
      }}
      maxAmount={wallet?.balance}
      onCurrencyInputChange={handleRepaymentAmountChange}
      errorMessage={strings('drawdown.repayment_excess_error')}
      leadText={`${strings(
        'payment_activities.wallet_balance',
      )}: ${amountWithCurrency(wallet.balance)}`}
      onClose={closeModal}
      actionItems={[
        {
          icon: 'calendar',
          showChevronIcon: false,
          leftSection: {
            title: `${format(
              wallet?.drawdown_repayment_date ?? new Date(),
              'dd MMM, yyyy',
            )}`,
            caption: strings('drawdown.repayment_date.single'),
          },
        },
        {
          icon: 'divide',
          showChevronIcon: false,
          leftSection: {
            caption: strings('drawdown.repayment_amount', {
              amount: amountWithCurrency(transactionFee),
            }),
            title: amountWithCurrency(totalRepaymentAmount),
          },
        },
      ]}
      doneButton={{
        title: strings('drawdown.make_payment'),
        onPress: () => {
          closeModal();
        },
      }}
    />
  );
};
