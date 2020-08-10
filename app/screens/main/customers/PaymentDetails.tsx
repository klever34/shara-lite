import {format} from 'date-fns';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {applyStyles, amountWithCurrency} from '../../../helpers/utils';
import {colors} from '../../../styles';
import {IPayment} from '../../../models/Payment';
import {useScreenRecord} from '../../../services/analytics';

const PaymentDetails = ({route}: any) => {
  useScreenRecord();
  const {payment}: {payment: IPayment} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={applyStyles('pb-md')}>
          <Text style={styles.itemTitle}>Amount</Text>
          <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
            {amountWithCurrency(payment.amount_paid)}
          </Text>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Payment Made</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {payment.created_at &&
                format(new Date(payment.created_at), 'MMM dd, yyyy')}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {payment.created_at &&
                format(new Date(payment.created_at), 'hh:mm:a')}
            </Text>
          </View>
          <View style={applyStyles('pb-md', {width: '48%'})}>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  item: {
    paddingBottom: 24,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors.primary,
    fontFamily: 'Rubik-Regular',
    textTransform: 'capitalize',
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

export default PaymentDetails;
