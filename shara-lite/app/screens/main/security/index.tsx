import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {SecurityOptionsScreen} from './SecurityOptionsScreen';

export type SecurityStackParamList = {
  SecurityOptions: undefined;
};

const SecurityStack = createNativeStackNavigator<SecurityStackParamList>();

export const SecurityScreen = () => {
  return (
    <SecurityStack.Navigator
      initialRouteName="SecurityOptions"
      screenOptions={{
        headerShown: false,
      }}>
      <SecurityStack.Screen
        name="SecurityOptions"
        component={SecurityOptionsScreen}
      />
    </SecurityStack.Navigator>
  );
};
