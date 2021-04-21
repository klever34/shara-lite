import React from 'react';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {SecurityOptionsScreen} from './SecurityOptionsScreen';
import {RouteProp} from '@react-navigation/native';
import {MainStackParamList} from '@/screens/main';

export type SecurityStackParamList = {
  SecurityOptions: {pinSet?: boolean};
};

const SecurityStack = createNativeStackNavigator<SecurityStackParamList>();

type SecurityScreenProps = {
  route: RouteProp<MainStackParamList, 'SecuritySettings'>;
};

export const SecurityScreen = ({route}: SecurityScreenProps) => {
  return (
    <SecurityStack.Navigator
      initialRouteName="SecurityOptions"
      screenOptions={{
        headerShown: false,
      }}>
      <SecurityStack.Screen
        name="SecurityOptions"
        component={SecurityOptionsScreen}
        initialParams={route.params}
      />
    </SecurityStack.Navigator>
  );
};
