import {getApiService, getAuthService, getI18nService} from '@/services';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';

const strings = getI18nService().strings;

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
        heading: strings('withdrawal_pin.change_transaction_pin.heading'),
        subHeading: strings('withdrawal_pin.subHeading'),
      }}
    />
  );
};
