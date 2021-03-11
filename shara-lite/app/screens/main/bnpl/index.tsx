import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {useDisbursementMethod} from '@/services/disbursement-method';
import {useAppNavigation} from '@/services/navigation';
import {colors} from '@/styles';
import React, {useCallback, useLayoutEffect} from 'react';
import {BNPLMainScreen} from './BNPLMainScreen';
import {BNPLNotAvailableScreen} from './BNPLNotAvailableScreen';

export const BNPLScreen = () => {
  const navigation = useAppNavigation();
  const {getDisbursementMethods} = useDisbursementMethod();
  // const bnplIsAvailable = !!getDisbursementMethods().length;
  const bnplIsAvailable = true;

  const handleGoToSettings = useCallback(() => {
    navigation.navigate('PaymentSettings');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Touchable onPress={!bnplIsAvailable ? handleGoToSettings : undefined}>
          <Icon
            size={28}
            color={colors.white}
            type="material-icons"
            name={!bnplIsAvailable ? 'settings' : 'search'}
          />
        </Touchable>
      ),
    });
  }, [navigation]);

  return !bnplIsAvailable ? (
    <BNPLNotAvailableScreen onPress={handleGoToSettings} />
  ) : (
    <BNPLMainScreen />
  );
};
