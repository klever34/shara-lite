import {applyStyles, colors} from '@/styles';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {ActiveBNPLScreen} from './ActiveBNPLScreen';
import {CompleteBNPLScreen} from './CompleteBNPLScreen';
import {Icon} from '@/components/Icon';
import {getI18nService} from '@/services';

type BNPLTabParamList = {
  Active: undefined;
  Complete: undefined;
};

const BNPLTab = createMaterialTopTabNavigator<BNPLTabParamList>();
const strings = getI18nService().strings;

export const BNPLMainScreen = () => {
  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <BNPLTab.Navigator
        initialRouteName="Active"
        tabBarOptions={{
          showIcon: true,
          activeTintColor: colors.primary,
          labelStyle: applyStyles('text-base'),
          inactiveTintColor: colors['gray-100'],
          tabStyle: applyStyles('flex-row items-center'),
          indicatorStyle: {backgroundColor: colors.primary},
          indicatorContainerStyle: {backgroundColor: colors.white},
        }}>
        <BNPLTab.Screen
          name="Active"
          component={ActiveBNPLScreen}
          options={{
            title: strings('bnpl.active_text'),
            tabBarIcon: ({color}) => {
              return (
                <Icon
                  size={24}
                  color={color}
                  name="clock"
                  type="material-community-icons"
                />
              );
            },
          }}
        />
        <BNPLTab.Screen
          name="Complete"
          component={CompleteBNPLScreen}
          options={{
            title: strings('bnpl.complete_text'),
            tabBarIcon: ({color}) => {
              return (
                <Icon
                  size={24}
                  color={color}
                  name="check-circle"
                  type="material-community-icons"
                />
              );
            },
          }}
        />
      </BNPLTab.Navigator>
    </SafeAreaView>
  );
};
