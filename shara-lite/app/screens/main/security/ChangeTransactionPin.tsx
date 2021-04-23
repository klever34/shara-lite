import {getApiService, getAuthService, getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import React, {useCallback} from 'react';
import {TransactionPin} from './TransactionPin';

const strings = getI18nService().strings;

export const ChangeTransactionPin = (props: any) => {
  const {
    route: {
      params: {token, heading},
    },
  } = props;
  const user = getAuthService().getUser();
  const navigation = useAppNavigation();

  const handleSubmit = useCallback(
    async (payload) => {
      try {
        await getApiService().changeTransactionPin(`${user?.id}`, {
          pin: payload.pin,
          confirm_pin: payload.confirmPin,
          token: token && token,
        });
      } catch (error) {
        navigation.navigate('ChangeTransactionPin');
        throw error;
      }
    },
    [navigation, token, user],
  );

  return (
    <TransactionPin
      title={strings('withdrawal_pin.enter_transaction_pin.page_title')}
      onSubmit={handleSubmit}
      hideButton={false}
      enterProps={{
        heading: heading,
        subHeading: strings('withdrawal_pin.subHeading'),
      }}
    />
  );
};
