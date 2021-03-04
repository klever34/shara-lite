import React, {useMemo} from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {PaymentActivitiesScreen} from '@/screens/main/money/PaymentActivitiesScreen';
import {MoneyUnavailableScreen} from './MoneyUnavailableScreen';
import {getAuthService, getRemoteConfigService} from '@/services';

export type MoneyStackParamList = {
  PaymentActivities: undefined;
  MoneyUnavailable: undefined;
};

const MoneyStack = createNativeStackNavigator<MoneyStackParamList>();

export const MoneyScreen = () => {
  const initialRouteName = useMemo(() => {
    try {
      const sharaMoneyEnabledCountries = getRemoteConfigService()
        .getValue('sharaMoneyEnabledCountries')
        .asString();
      const user = getAuthService().getUser();
      return !JSON.parse(sharaMoneyEnabledCountries)[user?.currency_code ?? '']
        ? 'PaymentActivities'
        : 'MoneyUnavailable';
    } catch (e) {
      return 'MoneyUnavailable';
    }
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
};
