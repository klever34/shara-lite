import {toNumber} from '@/components';
import {TransactionSuccessModal} from '@/components/TransactionSuccessModal';
import {amountWithCurrency} from '@/helpers/utils';
import {getAnalyticsService, getApiService, getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {AmountForm} from './AmountForm';

const strings = getI18nService().strings;

export const MakeDrawdownRepaymentForm = (props: any) => {
  const {wallet, openModal, closeModal} = props;
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveRepayment = useCallback(
    async (amount) => {
      try {
        setIsSaving(true);
        await getApiService().makeDrawdownRepayment({
          amount: toNumber(amount),
        });
        setIsSaving(false);
        closeModal();
        getAnalyticsService()
          .logEvent('takeDrawdown', {
            amount: Number(amount),
          })
          .then(() => {});
        openModal('full', {
          renderContent: () => (
            <TransactionSuccessModal
              subheading={strings('drawdown.repayment_success', {
                amount: amountWithCurrency(toNumber(amount)),
              })}
              onDone={() => {
                closeModal();
              }}
            />
          ),
        });
      } catch (error) {
        setIsSaving(false);
        handleError(error);
      }
    },
    [openModal, closeModal],
  );

  const handleValidateAmountForm = useCallback(
    (values) => {
      const errors = {} as {amount: string};
      if (!values.amount) {
        errors.amount = strings('drawdown.amount_required_error');
      } else if (
        !!wallet?.drawdown_amount_owed &&
        toNumber(values.amount) > wallet?.drawdown_amount_owed
      ) {
        errors.amount = strings('drawdown.repayment_excess_error');
      }
      return errors;
    },
    [wallet?.drawdown_amount_owed],
  );

  return (
    <AmountForm
      header={{
        title: strings('drawdown.repayment'),
      }}
      maxAmount={wallet?.drawdown_amount_owed}
      validateFn={handleValidateAmountForm}
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
            caption: strings('drawdown.repayment_date.without_date'),
          },
        },
      ]}
      doneButton={{
        isLoading: isSaving,
        onPress: handleSaveRepayment,
        title: strings('drawdown.make_payment'),
      }}
    />
  );
};
