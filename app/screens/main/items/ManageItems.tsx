import {HeaderRight} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {colors} from '@/styles';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {SafeAreaView} from 'react-native';
import {ActivityTab} from './ActivityTab';
import {ItemsTab} from './ItemsTab';

type ManageItemsTabParamList = {
  ActivityTab: undefined;
  ItemsTab: undefined;
};

const ManageItemTab = createMaterialTopTabNavigator<ManageItemsTabParamList>();

export const ManageItems = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderRight menuOptions={[]} />,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <ManageItemTab.Navigator
        initialRouteName="ItemsTab"
        tabBarOptions={{
          indicatorContainerStyle: {backgroundColor: colors.white},
          indicatorStyle: applyStyles('bg-primary h-4 rounded-2'),
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: colors.primary,
          inactiveTintColor: colors['gray-300'],
        }}>
        <ManageItemTab.Screen
          name="ItemsTab"
          component={ItemsTab}
          options={{title: 'Items'}}
        />
        <ManageItemTab.Screen
          name="ActivityTab"
          component={ActivityTab}
          options={{title: 'Activity'}}
        />
      </ManageItemTab.Navigator>
    </SafeAreaView>
  );
};
