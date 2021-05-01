import React, {useCallback, useEffect, useMemo} from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {PaymentActivitiesScreen} from '@/screens/main/money/PaymentActivitiesScreen';
import {MoneyUnavailableScreen} from './MoneyUnavailableScreen';
import {
  getApiService,
  getAuthService,
  getRemoteConfigService,
} from '@/services';
import {withModal} from '@/helpers/hocs';
import {SetPinModal} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {version as currentVersion} from '../../../../package.json';

export type MoneyStackParamList = {
  PaymentActivities: undefined;
  MoneyUnavailable: undefined;
};

const MoneyStack = createNativeStackNavigator<MoneyStackParamList>();

export const MoneyScreen = withModal(({openModal, closeModal}) => {
  const navigation = useAppNavigation();
  const initialRouteName = useMemo(() => {
    try {
      const sharaMoneyEnabledCountries = getRemoteConfigService()
        .getValue('sharaMoneyEnabledCountries')
        .asString();
      const user = getAuthService().getUser();
      return JSON.parse(sharaMoneyEnabledCountries)[user?.currency_code ?? '']
        ? 'PaymentActivities'
        : 'MoneyUnavailable';
    } catch (e) {
      return 'MoneyUnavailable';
    }
  }, []);

  const handleSetWithdrawalPin = useCallback(() => {
    navigation.navigate('SecuritySettings', {pinSet: false});
  }, [navigation]);

  let transactionPinVersion = getRemoteConfigService()
    .getValue('transactionPinVersion')
    .asString();

  const shouldShowSetPinModal = useMemo(() => {
    if (!transactionPinVersion || !currentVersion) {
      return false;
    }
    const [transactionPinVersionNumber] = transactionPinVersion.split('-');
    const [currentVersionNumber] = currentVersion.split('-');
    let [
      transactionPinMajor,
      transactionPinMinor,
      transactionPinPatch,
    ] = transactionPinVersionNumber.split('.');
    let [major, minor, patch] = currentVersionNumber.split('.');
    if (Number(transactionPinMajor) !== Number(major)) {
      return Number(major) < Number(transactionPinMajor);
    } else if (Number(transactionPinMinor) !== Number(minor)) {
      return Number(minor) < Number(transactionPinMinor);
    } else if (Number(transactionPinPatch) !== Number(patch)) {
      return Number(patch) < Number(transactionPinPatch);
    }
    return false;
  }, []);

  useEffect(() => {
    const fetchUserPin = async () => {
      const user = getAuthService().getUser();
      if (!user) {
        return;
      }
      try {
        const {data: pinSet} = await getApiService().transactionPin(user?.id);
        if (!pinSet && shouldShowSetPinModal) {
          openModal('full', {
            renderContent: () => (
              <SetPinModal
                onSkip={closeModal}
                onSetWithdrawalPin={handleSetWithdrawalPin}
              />
            ),
          });
        }
      } catch (error) {}
    };

    fetchUserPin();
  }, []);

  return (
    <MoneyStack.Navigator initialRouteName={initialRouteName}>
      <MoneyStack.Screen
        name="PaymentActivities"
        component={PaymentActivitiesScreen}
        options={{headerShown: false}}
      />
      <MoneyStack.Screen
        name="MoneyUnavailable"
        component={MoneyUnavailableScreen}
        options={{headerShown: false}}
      />
    </MoneyStack.Navigator>
  );
});
