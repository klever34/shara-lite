import {Icon} from '@/components/Icon';
import {TabBarLabel} from '@/components/TabBarLabel';
import {CustomersScreen} from '@/screens/main/customers';
import {TransactionsScreen} from '@/screens/main/transactions';
import {applyStyles, colors, navBarHeight} from '@/styles';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useContext, useEffect} from 'react';
import {SafeAreaView, View, Text, Image} from 'react-native';
import {Header} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {useInfo} from '@/helpers/hooks';
import {getAuthService} from '@/services';
import {EntryButton, EntryContext} from '@/components/EntryView';
import Touchable from '@/components/Touchable';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type MainNavParamList = {
  TransactionsTab: undefined;
  PaymentsTab: undefined;
  EntryTab: undefined;
  CustomersTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

const Nothing = () => null;

export const HomeScreen = () => {
  const navigation = useAppNavigation();
  const business = useInfo(() => getAuthService().getBusinessInfo());
  const {setCurrentCustomer} = useContext(EntryContext);

  useEffect(() => {
    setCurrentCustomer?.(null);
  }, [setCurrentCustomer]);

  navigation.addListener('focus', () => {
    setCurrentCustomer?.(null);
  });

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
        <Touchable onPress={() => navigation.navigate('BusinessSettings')}>
          <View style={applyStyles('flex-row items-center ml-16')}>
            <Image
              source={{
                uri: business.profile_image?.url,
              }}
              style={applyStyles('w-full rounded-12', {
                width: 24,
                height: 24,
              })}
            />
            <View style={applyStyles('pl-12')}>
              <Text
                style={applyStyles(
                  'text-uppercase text-sm text-700 text-white',
                )}>
                {business.name}
              </Text>
            </View>
          </View>
        </Touchable>
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
              <TabBarLabel {...labelProps}>{strings('activities')}</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="feathericons" name="home" size={20} color={color} />
            ),
          }}
        />
        <MainNav.Screen
          name="EntryTab"
          component={Nothing}
          options={{
            tabBarButton: () => {
              return <EntryButton />;
            },
          }}
        />
        <MainNav.Screen
          name="CustomersTab"
          component={CustomersScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>
                {strings('customer', {count: 2})}
              </TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="feathericons" name="user" size={20} color={color} />
            ),
          }}
        />
      </MainNav.Navigator>
    </SafeAreaView>
  );
};
