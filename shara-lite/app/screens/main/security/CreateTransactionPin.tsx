import {getApiService, getAuthService, getI18nService} from '@/services';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';
import {useAppNavigation} from '@/services/navigation';

const strings = getI18nService().strings;

export const CreateTransactionPin = () => {
  const user = getAuthService().getUser();
  const navigation = useAppNavigation();

  const handleSubmit = useCallback(
    async (payload) => {
      try {
        const res = await getApiService().setTransactionPin(`${user?.id}`, {
          pin: payload.pin,
          confirm_pin: payload.confirmPin,
        });
        navigation.navigate('SecurityQuestions', {token: res.data.token});
      } catch (error) {
        throw error;
      }
    },
    [navigation, user],
  );

  return (
    <TransactionPin
      title={strings('withdrawal_pin.enter_transaction_pin.page_title')}
      onSubmit={handleSubmit}
      hideButton={true}
      enterProps={{
        heading: strings('withdrawal_pin.create_transaction_pin.heading'),
        subHeading: strings('withdrawal_pin.subHeading'),
      }}
    />
  );
};
