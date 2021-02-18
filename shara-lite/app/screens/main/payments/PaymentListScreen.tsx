import {withModal} from '@/helpers/hocs';
import {useAppNavigation} from '@/services/navigation';
import React, {useLayoutEffect} from 'react';
import WithdrawalMethod from './WithdrawalMethod';

export const PaymentListScreen = withModal(() => {
  const navigation = useAppNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => null,
    });
  }, [navigation]);

  return <WithdrawalMethod />;
});
