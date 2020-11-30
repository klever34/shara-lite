import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {amountWithCurrency} from '@/helpers/utils';
import {getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {StackHeaderLeftButtonProps} from '@react-navigation/stack';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Image, SafeAreaView, Text, View} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {AllTransactionsListScreen} from './AllTransactionsListScreen';
import {OwedTransactionsListScreen} from './OwedTransactionsListScreen';

type TransactionTabParamList = {
  AllTransactions: undefined;
  OwedTransactions: undefined;
};

export const TransactionListScreen = () => {
  const navigation = useAppNavigation();
  const {getTransactions} = useTransaction();

  const [youGaveAmount, setYouGaveAmount] = useState(0);
  const [youCollectedAmount, setYouCollectedAmount] = useState(0);
  const [myTransactions, setMyTransactions] = useState(getTransactions());
  const [business, setBusiness] = useState(getAuthService().getBusinessInfo());

  const image = business.profile_image?.url
    ? {
        uri: business.profile_image.url,
      }
    : require('@/assets/images/shara-user-img.png');

  const TransactionListTab = createMaterialTopTabNavigator<
    TransactionTabParamList
  >();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: (props: StackHeaderLeftButtonProps) => {
        return (
          <HeaderBackButton
            {...props}
            backImage={() => {
              return (
                <View style={applyStyles('flex-row center')}>
                  <Icon
                    size={22}
                    name="layers"
                    borderRadius={12}
                    type="feathericons"
                    color={colors['gray-300']}
                  />
                  <Text
                    style={applyStyles(
                      'pl-sm text-md text-gray-300 text-uppercase',
                      {
                        fontFamily: 'Rubik-Medium',
                      },
                    )}
                    numberOfLines={1}>
                    Transactions
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
    });
  }, [navigation]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const userTransactions = getTransactions();

      setMyTransactions(userTransactions);
      setBusiness(getAuthService().getBusinessInfo());
    });
  }, [getTransactions, navigation]);

  useEffect(() => {
    const collectedAmount = myTransactions
      .filter((item) => item.isPaid)
      .map((item) => item.total_amount)
      .reduce((acc, item) => acc + item, 0);
    const gaveAmount = myTransactions
      .filter((item) => !item.isPaid)
      .map((item) => item.credit_amount)
      .reduce((acc, item) => acc + item, 0);

    setYouGaveAmount(gaveAmount);
    setYouCollectedAmount(collectedAmount);
  }, [myTransactions, myTransactions.length]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <View
        style={applyStyles('flex-row items-center bg-white p-16', {
          borderBottomWidth: 1,
          borderBottomColor: colors['gray-20'],
        })}>
        <Image
          source={image}
          style={applyStyles('w-full rounded-8', {
            width: 32,
            height: 32,
          })}
        />
        <View style={applyStyles('px-16')}>
          <Text
            style={applyStyles(
              'text-uppercase text-400 text-gray-200 text-xs',
            )}>
            You've collected
          </Text>
          <Text style={applyStyles('text-700 text-green-200')}>
            {amountWithCurrency(youCollectedAmount)}
          </Text>
        </View>
        <View>
          <Text
            style={applyStyles(
              'text-uppercase text-400 text-gray-200 text-xs',
            )}>
            You are owed
          </Text>
          <Text style={applyStyles('text-700 text-red-200')}>
            {amountWithCurrency(youGaveAmount)}
          </Text>
        </View>
      </View>
      <TransactionListTab.Navigator
        initialRouteName="AllTransactions"
        tabBarOptions={{
          activeTintColor: colors['gray-300'],
          inactiveTintColor: colors['gray-200'],
          labelStyle: {fontFamily: 'Roboto-Regular'},
          indicatorStyle: {backgroundColor: colors['red-200']},
          indicatorContainerStyle: {backgroundColor: colors.white},
        }}>
        <TransactionListTab.Screen
          name="AllTransactions"
          component={AllTransactionsListScreen}
          options={{title: 'All Transactions'}}
        />
        <TransactionListTab.Screen
          name="OwedTransactions"
          options={{title: 'Owed to you'}}
          component={OwedTransactionsListScreen}
        />
      </TransactionListTab.Navigator>
    </SafeAreaView>
  );
};
