import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns/esm';
import React, {useCallback} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Button} from '../../../components';
import Touchable from '../../../components/Touchable';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {ICustomer} from '../../../models';
import {ICredit} from '../../../models/Credit';
import {colors} from '../../../styles';

const CreditsTab = ({customer}: {customer: ICustomer}) => {
  const navigation = useNavigation();
  const credits = customer.credits || [];
  const overdueCredit = credits.filter(({amount_left}) => amount_left > 0);
  const totalCreditsAmount = credits.reduce(
    (total, {total_amount}) => total + total_amount,
    0,
  );
  const overdueCreditsAmount = credits.reduce(
    (total, {amount_left}) => total + amount_left,
    0,
  );

  const handleViewDetails = useCallback(
    (creditDetails: ICredit) => {
      navigation.navigate('CustomerCreditPayment', {creditDetails});
    },
    [navigation],
  );

  const handleNavigation = useCallback(
    (route: string, options?: object) => {
      navigation.navigate(route, options);
    },
    [navigation],
  );

  const renderCreditItem = ({item: credit}: {item: ICredit}) => {
    return (
      <Touchable onPress={() => handleViewDetails(credit)}>
        <View
          style={applyStyles(
            'px-lg',
            'py-lg',
            'flex-row',
            'justify-space-between',
            {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            },
          )}>
          <View>
            <Text
              style={applyStyles('pb-sm', 'text-400', {
                fontSize: 16,
                color: colors['gray-300'],
              })}>
              {credit?.customer?.name}
            </Text>
            <Text
              style={applyStyles('text-400', {
                fontSize: 16,
                color: colors['gray-200'],
              })}>
              {credit.created_at && format(credit.created_at, 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={applyStyles({alignItems: 'flex-end'})}>
            <Text
              style={applyStyles('pb-sm', 'text-400', {
                fontSize: 16,
                color: colors.primary,
              })}>
              &#8358;{numberWithCommas(credit.amount_left)}
            </Text>
            <Text
              style={applyStyles('text-400', {
                fontSize: 14,
                color: colors['gray-200'],
              })}>
              {credit.receipt?.payments && credit.receipt?.payments[0].method}
            </Text>
          </View>
        </View>
      </Touchable>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={applyStyles('p-xl')}>
        <Button
          title="record credit payment"
          style={applyStyles('mb-lg', {width: '100%'})}
          onPress={() => handleNavigation('CustomerRecordCreditPayment')}
        />
        <Touchable
          onPress={() =>
            handleNavigation('CustomerTotalCredit', {
              credits,
            })
          }>
          <View
            style={applyStyles('w-full p-lg mb-lg', {
              elevation: 3,
              borderRadius: 8,
              backgroundColor: colors.white,
            })}>
            <Text
              style={applyStyles('text-400 text-uppercase', {
                color: colors['gray-200'],
              })}>
              You are being owed
            </Text>
            <Text
              style={applyStyles('pb-xs text-700', {
                fontSize: 24,
                color: colors['gray-300'],
              })}>
              &#8358;{numberWithCommas(totalCreditsAmount)}
            </Text>
            <Text
              style={applyStyles('text-400 text-uppercase', {
                color: colors.primary,
              })}>
              View details
            </Text>
          </View>
        </Touchable>
        <Touchable
          onPress={() =>
            handleNavigation('CustomerOverdueCredit', {
              credits: overdueCredit,
            })
          }>
          <View
            style={applyStyles('w-full p-lg mb-lg', {
              elevation: 3,
              borderRadius: 8,
              backgroundColor: colors.white,
            })}>
            <Text
              style={applyStyles('text-400 text-uppercase', {
                color: colors['gray-200'],
              })}>
              You are to collect
            </Text>
            <Text
              style={applyStyles('pb-xs text-700', {
                fontSize: 24,
                color: colors.primary,
              })}>
              &#8358;{numberWithCommas(overdueCreditsAmount)}
            </Text>
            <Text
              style={applyStyles('text-400 text-uppercase', {
                color: colors.primary,
              })}>
              View details
            </Text>
          </View>
        </Touchable>
      </View>
      {!!credits.length && (
        <View style={applyStyles('h-full', {backgroundColor: colors.white})}>
          <Text
            style={applyStyles('text-500 py-xs px-lg', {
              borderBottomWidth: 1,
              color: colors['gray-300'],
              borderBottomColor: colors['gray-20'],
            })}>
            Payment History
          </Text>
          <FlatList
            data={credits}
            renderItem={renderCreditItem}
            keyExtractor={(item) => `${item.id}`}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['gray-10'],
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  totalCreditText: {
    paddingBottom: 4,
    color: colors.primary,
  },
  toalCreditAmount: {
    fontSize: 24,
    paddingBottom: 12,
    color: colors['gray-300'],
  },
  creditItem: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  item: {
    paddingBottom: 16,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  itemDataLarge: {
    fontSize: 18,
    color: colors['gray-300'],
  },
  itemDataMedium: {
    fontSize: 16,
  },
  itemDataSmall: {
    fontSize: 12,
  },
});

export default CreditsTab;
