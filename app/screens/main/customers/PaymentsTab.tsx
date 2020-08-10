import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns/esm';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View, FlatList} from 'react-native';
import {applyStyles, amountWithCurrency} from '../../../helpers/utils';
import {colors} from '../../../styles';
import {ICustomer} from '../../../models';
import {IPayment} from '../../../models/Payment';
import EmptyState from '../../../components/EmptyState';
import {ActionCard} from '../../../components';

const PaymentsTab = ({customer}: {customer: ICustomer}) => {
  const navigation = useNavigation();
  const payments = customer.payments || [];

  const handleViewDetails = (payment: IPayment) => {
    navigation.navigate('CustomerPaymentDetails', {payment});
  };

  const renderPaymentItem = ({item: payment}: {item: IPayment}) => {
    return (
      <View style={styles.creditItem}>
        <ActionCard
          buttonText="view details"
          onClick={() => handleViewDetails(payment)}>
          <View style={applyStyles('pb-sm')}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              {amountWithCurrency(payment.amount_paid)}
            </Text>
          </View>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Payment Made</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {payment.created_at
                  ? format(new Date(payment.created_at), 'MMM dd, yyyy')
                  : ''}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {payment.created_at
                  ? format(new Date(payment.created_at), 'hh:mm:a')
                  : ''}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Payment Type</Text>
              <Text
                style={applyStyles(
                  'text-400 text-capitalize',
                  styles.itemDataMedium,
                )}>
                {payment.type}
              </Text>
            </View>
          </View>
        </ActionCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {payments.length ? (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => `${item.id}`}
        />
      ) : (
        <EmptyState
          heading="No payments"
          source={require('../../../assets/images/coming-soon.png')}
          text={`Payment records for ${customer.name} will be displayed here`}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
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
    fontFamily: 'Rubik-Regular',
  },
  itemDataLarge: {
    fontSize: 18,
    color: colors['gray-300'],
  },
  itemDataMedium: {
    fontSize: 16,
    color: colors['gray-300'],
  },
  itemDataSmall: {
    fontSize: 12,
    color: colors['gray-300'],
  },
});

export default PaymentsTab;
