import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns/esm';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {colors} from '../../../styles';
import {payments} from '../data.json';
import ActionCard from './ActionCard';

const PaymentsTab = () => {
  const navigation = useNavigation();

  const handleViewDetails = (payment: Payment) => {
    navigation.navigate('CreditPayment', {payment});
  };

  const renderPaymentItem = ({item: payment}: {item: Payment}) => {
    return (
      <View style={styles.creditItem}>
        <ActionCard
          buttonIcon="eye"
          buttonText="view details"
          onClick={() => handleViewDetails(payment)}>
          <View style={applyStyles('pb-sm')}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              &#8358;{numberWithCommas(payment.amount)}
            </Text>
          </View>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Payment Made</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {format(new Date(payment.paidOn), 'MMM dd, yyyy')}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {format(new Date(payment.paidOn), 'hh:mm:a')}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Payment Method</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {payment.paymentMethod}
              </Text>
            </View>
          </View>
          <View style={applyStyles('pb-sm')}>
            <Text style={styles.itemTitle}>Received by</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {payment.receivedBy}
            </Text>
          </View>
        </ActionCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
      />
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

export default PaymentsTab;
