import {getApiService, getAuthService} from '@/services';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';

export const ChangeTransactionPin = (props: any) => {
  const {
    route: {
      params: {token},
    },
  } = props;
  const user = getAuthService().getUser();

  const handleSubmit = useCallback(
    async (payload) => {
      try {
        await getApiService().changeTransactionPin(`${user?.id}`, {
          pin: payload.pin,
          confirm_pin: payload.confirmPin,
          token: token && token,
        });
      } catch (error) {
        throw error;
      }
    },
    [token, user],
  );

  return (
    <TransactionPin
      onSubmit={handleSubmit}
      enterProps={{
        heading: 'Enter old Tranaction PIN',
        subHeading: 'All transactions are safe, secure and instant.',
      }}
    />
  );
};
