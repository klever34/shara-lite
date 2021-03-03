import React from 'react';
import {colors} from '@/styles';
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
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontSize: 16,
          fontFamily: 'CocogoosePro-SemiLight',
        },
        headerTintColor: colors['gray-300'],
      }}>
      <MoreStack.Screen name="MoreOptions" component={MoreOptionsScreen} />
    </MoreStack.Navigator>
  );
};
