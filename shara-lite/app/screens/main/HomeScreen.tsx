import {Icon} from '@/components/Icon';
import {TabBarLabel} from '@/components/TabBarLabel';
import {CustomersScreen} from '@/screens/main/customers';
import {TransactionsScreen} from '@/screens/main/transactions';
import {applySpacing, applyStyles, colors, navBarHeight} from '@/styles';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React, {useContext, useEffect} from 'react';
import {Text} from '@/components';
import {Image, SafeAreaView, View} from 'react-native';
import {Header} from '@/components';
import {useAppNavigation} from '@/services/navigation';
import {useInfo} from '@/helpers/hooks';
import {getAuthService, getI18nService} from '@/services';
import {EntryContext} from '@/components/EntryView';
import Touchable from '@/components/Touchable';
import {useLastSeen} from '@/services/last-seen';
import {PaymentsScreen} from './payments';
import {MoreScreen} from './more';

const strings = getI18nService().strings;

export type MainNavParamList = {
  TransactionsTab: undefined;
  PaymentsTab: undefined;
  EntryTab: undefined;
  CustomersTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

export const HomeScreen = () => {
  const navigation = useAppNavigation();
  const business = useInfo(() => getAuthService().getBusinessInfo());
  const {setCurrentCustomer} = useContext(EntryContext);
  const headerImageSource = business.profile_image?.url
    ? {
        uri: business.profile_image?.url,
      }
    : require('@/assets/images/shara_logo_white.png');
  const {updateLastSeen} = useLastSeen();

  useEffect(() => {
    setCurrentCustomer?.(null);
  }, [setCurrentCustomer]);

  navigation.addListener('focus', () => {
    setCurrentCustomer?.(null);
    updateLastSeen();
  });

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <Header style={applyStyles('bg-primary')}>
        <Touchable onPress={() => navigation.navigate('BusinessSettings')}>
          <View style={applyStyles('flex-row items-center ml-16')}>
            <Image
              resizeMode={business.profile_image?.url ? undefined : 'contain'}
              source={headerImageSource}
              style={applyStyles('w-full rounded-24', {
                width: applySpacing(24),
                height: applySpacing(24),
              })}
            />
            <View style={applyStyles('pl-12')}>
              <Text
                style={applyStyles(
                  'text-uppercase text-base text-700 text-white',
                )}>
                {business.name || strings('home_screen_setup_business_text')}
              </Text>
            </View>
          </View>
        </Touchable>
      </Header>

      <MainNav.Navigator
        initialRouteName="TransactionsTab"
        tabBarOptions={{
          labelStyle: {fontFamily: 'Rubik-Regular'},
          activeTintColor: colors.primary,
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
              <TabBarLabel {...labelProps}>{strings('home')}</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="material-icons" name="home" size={28} color={color} />
            ),
          }}
        />
        <MainNav.Screen
          name="CustomersTab"
          component={CustomersScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>
                {strings('client', {count: 2})}
              </TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon
                type="material-icons"
                name="people"
                size={28}
                color={color}
              />
            ),
          }}
        />
        <MainNav.Screen
          name="PaymentsTab"
          component={PaymentsScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>{strings('payments')}</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon
                type="material-icons"
                name="attach-money"
                size={28}
                color={color}
              />
            ),
          }}
        />
        <MainNav.Screen
          name="MoreTab"
          component={MoreScreen}
          options={{
            tabBarLabel: (labelProps) => (
              <TabBarLabel {...labelProps}>{strings('more_text')}</TabBarLabel>
            ),
            tabBarIcon: ({color}) => (
              <Icon type="material-icons" name="menu" size={28} color={color} />
            ),
          }}
        />
      </MainNav.Navigator>
    </SafeAreaView>
  );
};
