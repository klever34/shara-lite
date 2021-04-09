import {Icon} from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IBNPLDrawdown} from '@/models/BNPLDrawdown';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/core';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MainStackParamList} from '..';
import {BNPLClientPaidScreen} from './BNPLClientPaidScreen';
import {BNPLClientUpcomingScreen} from './BNPLClientUpcomingScreen';

export type BNPLClientTabParamList = {
  Upcoming: {data: IBNPLDrawdown};
  Paid: {data: IBNPLDrawdown};
};

type BNPLClientScreenProps = {
  route: RouteProp<MainStackParamList, 'BNPLClientScreen'>;
};

const BNPLClientTab = createMaterialTopTabNavigator<BNPLClientTabParamList>();
const strings = getI18nService().strings;

export const BNPLClientScreen = (props: BNPLClientScreenProps) => {
  const {route} = props;
  const {data} = route.params;
  const {customer} = data;

  const navigation = useAppNavigation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePressListItem = useCallback(() => {
    navigation.navigate('BNPLTransactionDetailsScreen', {transaction: data});
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <View style={applyStyles('px-24 py-16 bg-primary flex-row items-center')}>
        <Touchable onPress={handleGoBack}>
          <View style={applyStyles('w-40 h-40 rounded-32 center')}>
            <Icon
              size={24}
              name="close"
              color={colors.white}
              type="material-community-icons"
            />
          </View>
        </Touchable>
        <View style={applyStyles('flex-row pl-16')}>
          <PlaceholderImage
            text={customer?.name ?? ''}
            style={applyStyles('mr-16')}
            image={customer?.image ? {uri: customer?.image} : undefined}
          />
          <View style={applyStyles('flex-1')}>
            <Text style={applyStyles('pb-4 text-700 text-white')}>
              {customer?.name}
            </Text>
            <Text style={applyStyles('text-white')}>
              {amountWithCurrency(data.repayment_amount)}
            </Text>
          </View>
          <View style={applyStyles('flex-1 center pl-32')}>
            <Touchable onPress={handlePressListItem}>
              <View style={applyStyles('w-40 h-40 rounded-32 center')}>
                <Icon
                  size={24}
                  color={colors.white}
                  type="material-icons"
                  name="menu"
                />
              </View>
            </Touchable>
          </View>
        </View>
      </View>
      <BNPLClientTab.Navigator
        initialRouteName="Upcoming"
        tabBarOptions={{
          showIcon: true,
          activeTintColor: colors.primary,
          labelStyle: applyStyles('text-base'),
          inactiveTintColor: colors['gray-100'],
          tabStyle: applyStyles('flex-row items-center'),
          indicatorStyle: {backgroundColor: colors.primary},
          indicatorContainerStyle: {backgroundColor: colors.white},
        }}>
        <BNPLClientTab.Screen
          name="Upcoming"
          initialParams={{data}}
          component={BNPLClientUpcomingScreen}
          options={{
            title: strings('bnpl.client.upcoming_text'),
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
        <BNPLClientTab.Screen
          name="Paid"
          initialParams={{data}}
          component={BNPLClientPaidScreen}
          options={{
            title: strings('bnpl.client.paid_text'),
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
      </BNPLClientTab.Navigator>
    </SafeAreaView>
  );
};