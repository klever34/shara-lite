import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns/esm';
import orderBy from 'lodash/orderBy';
import React, {useCallback} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Button} from '@/components';
import Touchable from '../../../components/Touchable';
import {PAYMENT_METHOD_LABEL} from '@/helpers/constants';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IPayment} from '@/models/Payment';
import {getPaymentsFromCredit} from '@/services/CreditPaymentService';
import {colors} from '@/styles';

const CreditsTab = ({customer}: {customer: ICustomer}) => {
  const today = new Date();
  const navigation = useNavigation();
  const credits = customer.credits || [];
  const creditPayments = getPaymentsFromCredit({credits: customer.credits});
  const overdueCredit = credits.filter(
    ({fulfilled, due_date}) =>
      !fulfilled && due_date && due_date.getTime() < today.getTime(),
  );
  const overdueCreditAmount = overdueCredit.reduce(
    (total, {amount_left}) => total + amount_left,
    0,
  );
  const remainingCredit = credits.filter((item) => item.amount_left > 0);
  const remainingCreditAmount = remainingCredit.reduce(
    (acc, item) => acc + item.amount_left,
    0,
  );

  const handleViewDetails = useCallback(
    (creditPaymentDetails: IPayment) => {
      navigation.navigate('CustomerCreditPaymentDetails', {
        creditPaymentDetails,
      });
    },
    [navigation],
  );

  const handleNavigation = useCallback(
    (route: string, options?: object) => {
      navigation.navigate(route, options);
    },
    [navigation],
  );

  const renderCreditItem = useCallback(
    ({item: credit}: {item: IPayment}) => {
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
                {amountWithCurrency(credit.amount_paid)}
              </Text>
              <Text
                style={applyStyles('text-400 text-capitalize', {
                  fontSize: 14,
                  color: colors['gray-200'],
                })}>
                {PAYMENT_METHOD_LABEL[credit.method]}
              </Text>
            </View>
          </View>
        </Touchable>
      );
    },
    [handleViewDetails],
  );

  return (
    <ScrollView persistentScrollbar={true} style={styles.container}>
      <View style={applyStyles('p-xl')}>
        <Button
          title="record credit payment"
          style={applyStyles('mb-lg', {width: '100%'})}
          disabled={!overdueCredit.length && !remainingCredit.length}
          onPress={() =>
            handleNavigation('CustomerRecordCreditPayment', {customer})
          }
        />
        <Touchable
          onPress={() =>
            handleNavigation('CustomerTotalCredit', {
              credits: remainingCredit,
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
              {amountWithCurrency(remainingCreditAmount)}
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
              {amountWithCurrency(overdueCreditAmount)}
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
            renderItem={renderCreditItem}
            keyExtractor={(item) => `${item._id}`}
            data={orderBy(creditPayments, 'created_at', 'desc')}
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
