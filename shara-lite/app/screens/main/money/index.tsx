import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {PaymentActivitiesScreen} from '@/screens/main/money/PaymentActivitiesScreen';

export type MoneyStackParamList = {
  PaymentActivities: undefined;
};

const MoneyStack = createNativeStackNavigator<MoneyStackParamList>();

export const MoneyScreen = () => {
  return (
    <MoneyStack.Navigator initialRouteName="PaymentActivities">
      <MoneyStack.Screen
        name="PaymentActivities"
        component={PaymentActivitiesScreen}
        options={{headerShown: false}}
      />
    </MoneyStack.Navigator>
  );
};
