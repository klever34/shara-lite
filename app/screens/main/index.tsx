import EmptyState from '@/components/EmptyState';
import {useCreditReminder} from '@/services/credit-reminder';
import {useRepeatBackToExit} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {RealmContext} from '@/services/realm/provider';
import {colors} from '@/styles';
import PubNub from 'pubnub';
import {PubNubProvider} from 'pubnub-react';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Config from 'react-native-config';
import getUuidByString from 'uuid-by-string';
import {getAuthService, getPubNubService} from '../../services';
import useRealmSyncLoader from '../../services/realm/useRealmSyncLoader';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TabBarLabel} from '@/components/TabBarLabel';
import {Icon} from '@/components/Icon';
import {ReceiptsScreen} from './receipts';
import {CustomersScreen} from './customers';
import {ProductsScreen} from './products';
import {MoreScreen} from './more';
import {applyStyles} from '@/styles';
import {HomeProvider} from '@/components';

export type MainNavParamList = {
  Receipts: undefined;
  CustomersTab: undefined;
  ProductsTab: undefined;
  MoreTab: undefined;
};

const MainNav = createBottomTabNavigator<MainNavParamList>();

const MainScreens = () => {
  useRepeatBackToExit();
  const realm = useRealm();
  const {isSyncCompleted} = useContext(RealmContext);

  useRealmSyncLoader();
  useCreditReminder();

  const [pubNubClient, setPubNubClient] = useState<PubNub | null>(null);

  useEffect(() => {
    const user = getAuthService().getUser();
    if (user) {
      const pubNub = new PubNub({
        subscribeKey: Config.PUBNUB_SUB_KEY,
        publishKey: Config.PUBNUB_PUB_KEY,
        uuid: getUuidByString(user.mobile),
      });
      const pubNubService = getPubNubService();
      pubNubService.setInstance(pubNub);
      setPubNubClient(pubNub);
    }
  }, []);

  if (!realm) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  if (!isSyncCompleted) {
    return (
      <EmptyState
        heading={'Sync in progress'}
        text={
          'We are syncing your data across the Shara app. This might take a few seconds.'
        }
        source={require('../../assets/images/coming-soon.png')}>
        <View style={applyStyles('mt-lg')}>
          <ActivityIndicator color={colors.primary} size={40} />
        </View>
      </EmptyState>
    );
  }

  if (!pubNubClient) {
    return (
      <View style={applyStyles('flex-1 center')}>
        <ActivityIndicator color={colors.primary} size={40} />
      </View>
    );
  }

  return (
    <PubNubProvider client={pubNubClient}>
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
    </PubNubProvider>
  );
};

export default MainScreens;
