import React, {useMemo} from 'react';
import {toNumber} from '@/components';
import {TransactionSuccessModal} from '@/components/TransactionSuccessModal';
import {amountWithCurrency} from '@/helpers/utils';
import {getAnalyticsService, getApiService, getI18nService} from '@/services';
import {useDrawdown} from '@/services/drawdown';
import {handleError} from '@/services/error-boundary';
import {format, parseISO} from 'date-fns';
import {useCallback, useState} from 'react';
import {AmountForm} from './AmountForm';

const strings = getI18nService().strings;

export const TakeDrawdownForm = (props: any) => {
  const {wallet, closeModal, openModal} = props;

  const {saveDrawdown} = useDrawdown();

  const [isSavingDrawdown, setIsSavingDrawdown] = useState(false);
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

  const handleSaveDrawdown = useCallback(
    async (amount) => {
      try {
        setIsSavingDrawdown(true);
        const {drawdown} = await getApiService().saveDrawdown({
          amount: toNumber(amount),
        });
        await saveDrawdown({
          drawdown: {
            ...drawdown,
            amount: Number(drawdown.amount),
            _partition: drawdown._partition.toString(),
            created_at: parseISO(drawdown.created_at),
            updated_at: parseISO(drawdown.updated_at),
            repayment_amount: Number(drawdown.repayment_amount),
          },
        });
        setIsSavingDrawdown(false);
        setAmount(undefined);
        closeModal();
        getAnalyticsService()
          .logEvent('takeDrawdown', {
            amount: Number(amount),
          })
          .then(() => {});
        openModal('full', {
          renderContent: () => (
            <TransactionSuccessModal
              subheading={strings('drawdown.withdraw_success', {
                amount: amountWithCurrency(toNumber(amount)),
              })}
              onDone={() => {
                closeModal();
              }}
            />
          ),
        });
      } catch (error) {
        setIsSavingDrawdown(false);
        handleError(error);
      }
    },
    [openModal, closeModal, saveDrawdown],
  );

  const handleValidateAmountForm = useCallback(
    (values) => {
      const errors = {} as {amount: string};
      if (!values.amount) {
        errors.amount = strings('drawdown.amount_required_error');
      } else if (
        !!wallet?.drawdown_amount_available &&
        toNumber(values.amount) > wallet?.drawdown_amount_available
      ) {
        errors.amount = strings('drawdown.withdraw_excess_error');
      }
      return errors;
    },
    [wallet?.drawdown_amount_available],
  );

  return (
    <AmountForm
      header={{
        title: strings('drawdown.take_drawdown'),
      }}
      maxAmount={wallet?.drawdown_amount_available}
      validateFn={handleValidateAmountForm}
      onCurrencyInputChange={(value) => handleRepaymentAmountChange(value)}
      leadText={strings('drawdown.take_drawdown_lead_text')}
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
            caption: strings('drawdown.repayment_date.without_date'),
          },
        },
        {
          icon: 'plus',
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
        title: strings('drawdown.request'),
        onPress: handleSaveDrawdown,
        isLoading: isSavingDrawdown,
      }}
    />
  );
};
