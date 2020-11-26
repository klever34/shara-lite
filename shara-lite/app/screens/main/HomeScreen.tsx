import {Icon} from '@/components/Icon';
import {TabBarLabel} from '@/components/TabBarLabel';
import {CustomersScreen} from '@/screens/main/customers';
import {MoreScreen} from '@/screens/main/more';
import {PaymentsScreen} from '@/screens/main/payments';
import {TransactionsScreen} from '@/screens/main/transactions';
import {EntryScreen} from '@/screens/main/entry';
import {applyStyles, colors} from '@/styles';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {SafeAreaView, View} from 'react-native';
import Keypad from '@/assets/images/keypad.svg';

export type MainNavParamList = {
  TransactionsTab: undefined;
  PaymentsTab: undefined;
  EntryTab: undefined;
  CustomersTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

export const HomeScreen = () => {
  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <MainNav.Navigator
        initialRouteName="TransactionsTab"
        tabBarOptions={{
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: colors['red-200'],
          inactiveTintColor: colors['gray-50'],
          style: applyStyles('h-80'),
          tabStyle: applyStyles('py-10'),
        }}>
        <MainNav.Screen
          name="TransactionsTab"
          component={TransactionsScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>Transactions</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="feathericons" name="layers" size={20} color={color} />
            ),
          }}
        />
        <MainNav.Screen
          name="PaymentsTab"
          component={PaymentsScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>Payments</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon
                type="feathericons"
                name="dollar-sign"
                size={20}
                color={color}
              />
            ),
          }}
        />
        <MainNav.Screen
          name="EntryTab"
          component={EntryScreen}
          options={{
            tabBarButton: ({}) => {
              return (
                <View
                  style={applyStyles(
                    'w-60 h-60 my-12 bg-primary rounded-32 center',
                  )}>
                  <Keypad width={24} height={24} />
                </View>
              );
            },
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
              <Icon type="feathericons" name="users" size={20} color={color} />
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
              <Icon type="feathericons" name="menu" size={20} color={color} />
            ),
          }}
        />
      </MainNav.Navigator>
    </SafeAreaView>
  );
};
