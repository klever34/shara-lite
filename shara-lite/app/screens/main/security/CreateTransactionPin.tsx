import {getApiService, getAuthService, getI18nService} from '@/services';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';

const strings = getI18nService().strings;

export const CreateTransactionPin = () => {
  const user = getAuthService().getUser();

  const handleSubmit = useCallback(
    async (payload) => {
      try {
        await getApiService().setTransactionPin(`${user?.id}`, {
          pin: payload.pin,
          confirm_pin: payload.confirmPin,
        });
      } catch (error) {
        throw error;
      }
    },
    [user],
  );

  return (
    <TransactionPin
      onSubmit={handleSubmit}
      hideButton={true}
      enterProps={{
        heading: strings('withdrawal_pin.create_transaction_pin.heading'),
        subHeading: strings('withdrawal_pin.subHeading'),
      }}
    />
  );
};
