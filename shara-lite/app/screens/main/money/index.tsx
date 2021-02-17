import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {PaymentActivitiesScreen} from '@/screens/main/money/PaymentActivitiesScreen';

export type MoneyStackParamList = {
  PaymentActivities: undefined;
};

const MoneyStack = createStackNavigator<MoneyStackParamList>();

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
