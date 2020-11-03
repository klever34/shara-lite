import React from 'react';
import {SafeAreaView} from 'react-native';
import {applyStyles, colors} from '@/styles';
import {HomeProvider} from '@/components';
import {ReceiptsScreen} from '@/screens/main/receipts';
import {TabBarLabel} from '@/components/TabBarLabel';
import {Icon} from '@/components/Icon';
import {CustomersScreen} from '@/screens/main/customers';
import {ProductsScreen} from '@/screens/main/products';
import {MoreScreen} from '@/screens/main/more';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

export type MainNavParamList = {
  Receipts: undefined;
  CustomersTab: undefined;
  ProductsTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

export const HomeScreen = () => {
  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <HomeProvider>
        <MainNav.Navigator
          initialRouteName="Receipts"
          tabBarOptions={{
            labelStyle: {fontFamily: 'Rubik-Regular'},
            activeTintColor: colors['red-200'],
            inactiveTintColor: colors['gray-50'],
            style: applyStyles('h-64'),
            tabStyle: applyStyles('py-10'),
          }}>
          <MainNav.Screen
            name="Receipts"
            component={ReceiptsScreen}
            options={{
              tabBarLabel: (labelProps) => (
                <TabBarLabel {...labelProps}>Receipts</TabBarLabel>
              ),
              tabBarIcon: ({color}) => (
                <Icon
                  type="feathericons"
                  name="file-text"
                  size={24}
                  color={color}
                />
              ),
            }}
          />
          <MainNav.Screen
            name="CustomersTab"
            component={CustomersScreen}
            options={{
              tabBarLabel: (labelProps) => (
                <TabBarLabel {...labelProps}>Customers</TabBarLabel>
              ),
              tabBarIcon: ({color}) => (
                <Icon
                  type="feathericons"
                  name="users"
                  size={24}
                  color={color}
                />
              ),
            }}
          />
          <MainNav.Screen
            name="ProductsTab"
            component={ProductsScreen}
            options={{
              tabBarLabel: (labelProps) => (
                <TabBarLabel {...labelProps}>Products</TabBarLabel>
              ),
              tabBarIcon: ({color}) => (
                <Icon type="feathericons" name="box" size={24} color={color} />
              ),
            }}
          />
          <MainNav.Screen
            name="MoreTab"
            component={MoreScreen}
            options={{
              tabBarLabel: (labelProps) => (
                <TabBarLabel {...labelProps}>More</TabBarLabel>
              ),
              tabBarIcon: ({color}) => (
                <Icon type="feathericons" name="menu" size={24} color={color} />
              ),
            }}
          />
        </MainNav.Navigator>
      </HomeProvider>
    </SafeAreaView>
  );
};
