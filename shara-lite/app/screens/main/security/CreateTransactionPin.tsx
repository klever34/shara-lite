import {getApiService, getAuthService} from '@/services';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';

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
      enterProps={{
        heading: 'Set 4-digit PIN for all your transactions',
        subHeading: 'All transactions are safe, secure and instant.',
      }}
    />
  );
};
