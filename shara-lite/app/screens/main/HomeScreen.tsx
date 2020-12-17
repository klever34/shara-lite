import {Icon} from '@/components/Icon';
import {TabBarLabel} from '@/components/TabBarLabel';
import {CustomersScreen} from '@/screens/main/customers';
import {TransactionsScreen} from '@/screens/main/transactions';
import {TransactionEntryScreen} from '@/screens/main/entry';
import {applyStyles, colors, navBarHeight} from '@/styles';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, View, Text, Image} from 'react-native';
import Keypad from '@/assets/images/keypad.svg';
import {HeaderBackButton} from '@react-navigation/stack';
import {EventArg} from '@react-navigation/native';
import {Header} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {useInfo} from '@/helpers/hooks';
import {getAuthService} from '@/services';

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
  const navigation = useAppNavigation();
  const business = useInfo(() => getAuthService().getBusinessInfo());
  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header
        style={applyStyles('bg-red-200')}
        headerRight={{
          options: [
            {
              icon: {name: 'menu', color: colors.white},
              onPress: () => {
                navigation.navigate('Settings');
              },
            },
          ],
        }}>
        <View style={applyStyles('flex-row items-center ml-16')}>
          <Image
            source={{
              uri: business.profile_image?.url,
            }}
            style={applyStyles('w-full rounded-8', {
              width: 24,
              height: 24,
            })}
          />
          <View style={applyStyles('pl-12')}>
            <Text
              style={applyStyles('text-uppercase text-sm text-700 text-white')}>
              {business.name}
            </Text>
          </View>
        </View>
      </Header>
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
              <Icon type="feathericons" name="home" size={20} color={color} />
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
              <Icon type="feathericons" name="user" size={20} color={color} />
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
