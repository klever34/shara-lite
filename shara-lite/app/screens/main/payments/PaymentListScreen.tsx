import {withModal} from '@/helpers/hocs';
import {useAppNavigation} from '@/services/navigation';
import React, {useLayoutEffect} from 'react';
import PaymentContainer from './PaymentContainer';

export const PaymentListScreen = withModal(() => {
  const navigation = useAppNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => null,
    });
  }, [navigation]);

  return <PaymentContainer />;
});
