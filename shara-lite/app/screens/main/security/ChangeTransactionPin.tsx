import {getApiService, getAuthService} from '@/services';
import {handleError} from '@/services/error-boundary';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';

export const ChangeTransactionPin = () => {
  const user = getAuthService().getUser();

  const handleSubmit = useCallback(
    async (payload) => {
      try {
        const verifyRes = await getApiService().verifyTransactionPin(
          `${user?.id}`,
          {pin: payload.pin},
        );
        return await getApiService().changeTransactionPin(
          `${user?.id}`,
          payload,
        );
      } catch (error) {
        handleError(error);
      }
    },
    [user],
  );

  return (
    <TransactionPin
      onSubmit={handleSubmit}
      enterProps={{
        heading: 'Enter tranaction PIN',
        subHeading: 'All transactions are safe, secure and instant.',
      }}
    />
  );
};
