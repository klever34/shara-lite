import {format} from 'date-fns';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {colors} from '../../../styles';

const PaymentDetails = ({route}: any) => {
  const {payment} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={applyStyles('pb-md')}>
          <Text style={styles.itemTitle}>Amount</Text>
          <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
            &#8358;{numberWithCommas(payment.amount)}
          </Text>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Payment Made</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {format(new Date(payment.paidOn), 'MMM dd, yyyy')}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {format(new Date(payment.paidOn), 'hh:mm:a')}
            </Text>
          </View>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Payment Method</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {payment.paymentMethod}
            </Text>
          </View>
        </View>
        <View style={applyStyles('pb-xl')}>
          <Text style={styles.itemTitle}>Received By</Text>
          <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
            {payment.receivedBy}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 54,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  item: {
    paddingBottom: 24,
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

export default PaymentDetails;
