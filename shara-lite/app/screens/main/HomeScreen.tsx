import {Icon} from '@/components/Icon';
import {TabBarLabel} from '@/components/TabBarLabel';
import {CustomersScreen} from '@/screens/main/customers';
import {MoreScreen} from '@/screens/main/more';
import {PaymentsScreen} from '@/screens/main/payments';
import {TransactionsScreen} from '@/screens/main/transactions';
import {TransactionEntryScreen} from '@/screens/main/entry';
import {applyStyles, colors, navBarHeight} from '@/styles';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, View} from 'react-native';
import Keypad from '@/assets/images/keypad.svg';
import {HeaderBackButton} from '@react-navigation/stack';
import {EventArg} from '@react-navigation/native';

export type MainNavParamList = {
  TransactionsTab: undefined;
  PaymentsTab: undefined;
  EntryTab: undefined;
  CustomersTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

export const HomeScreen = () => {
  const [currentTab, setCurrentTab] = useState<keyof MainNavParamList>(
    'EntryTab',
  );

  const handleTabPress = useCallback(
    (evt: EventArg<Extract<'tabPress', string>, true>) => {
      setCurrentTab(evt.target?.split('-')?.[0] as keyof MainNavParamList);
    },
    [],
  );

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <MainNav.Navigator
        initialRouteName="TransactionsTab"
        tabBarOptions={{
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: colors['red-200'],
          inactiveTintColor: colors['gray-50'],
          style: applyStyles({height: navBarHeight}),
          tabStyle: applyStyles('py-20'),
          iconStyle: applyStyles('py-4'),
          keyboardHidesTabBar: true,
        }}>
        <MainNav.Screen
          name="TransactionsTab"
          component={TransactionsScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>Activities</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="feathericons" name="layers" size={20} color={color} />
            ),
          }}
          listeners={{
            tabPress: handleTabPress,
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
          listeners={{
            tabPress: handleTabPress,
          }}
        />
        <MainNav.Screen
          name="EntryTab"
          component={TransactionEntryScreen}
          options={{
            tabBarButton: ({onPress}) => {
              return (
                <HeaderBackButton
                  backImage={() => {
                    return (
                      <View
                        style={applyStyles(
                          'w-60 h-60 my-12 rounded-32 center',
                          currentTab === 'EntryTab'
                            ? 'bg-primary'
                            : 'bg-gray-100',
                        )}>
                        <Keypad width={24} height={24} />
                      </View>
                    );
                  }}
                  onPress={onPress as () => void}
                />
              );
            },
          }}
          listeners={{
            tabPress: handleTabPress,
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
          listeners={{
            tabPress: handleTabPress,
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
          listeners={{
            tabPress: handleTabPress,
          }}
        />
      </MainNav.Navigator>
    </SafeAreaView>
  );
};
