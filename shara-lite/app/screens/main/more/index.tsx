import React from 'react';
import {colors} from '@/styles';
import {createStackNavigator} from '@react-navigation/stack';
import {MoreOptionsScreen} from './MoreOptionsScreen';

export type MoreStackParamList = {
  MoreOptions: undefined;
};

const MoreStack = createStackNavigator<MoreStackParamList>();

export const MoreScreen = () => {
  return (
    <MoreStack.Navigator
      initialRouteName="MoreOptions"
      screenOptions={{
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
