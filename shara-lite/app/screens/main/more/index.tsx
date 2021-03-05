import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {MoreOptionsScreen} from './MoreOptionsScreen';

export type MoreStackParamList = {
  MoreOptions: undefined;
};

const MoreStack = createNativeStackNavigator<MoreStackParamList>();

export const MoreScreen = () => {
  return (
    <MoreStack.Navigator
      initialRouteName="MoreOptions"
      screenOptions={{
        headerShown: false,
      }}>
      <MoreStack.Screen name="MoreOptions" component={MoreOptionsScreen} />
    </MoreStack.Navigator>
  );
};
