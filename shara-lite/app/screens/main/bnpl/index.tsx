import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {useBNPLApproval} from '@/services/bnpl-approval';
import {useAppNavigation} from '@/services/navigation';
import {colors} from '@/styles';
import React, {useCallback, useLayoutEffect} from 'react';
import {BNPLMainScreen} from './BNPLMainScreen';
import {BNPLNotAvailableScreen} from './BNPLNotAvailableScreen';

export const BNPLScreen = () => {
  const navigation = useAppNavigation();

  const {getBNPLApproval} = useBNPLApproval();
  const bnplApproval = getBNPLApproval();
  const bnplIsAvailable = !!bnplApproval;

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
  }, [bnplIsAvailable, handleGoToSettings, navigation]);

  return !bnplIsAvailable ? (
    <BNPLNotAvailableScreen onPress={handleGoToSettings} />
  ) : (
    <BNPLMainScreen />
  );
};
