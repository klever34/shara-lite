import {format} from 'date-fns';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {applyStyles, amountWithCurrency} from 'app-v1/helpers/utils';
import {colors} from 'app-v1/styles';

const OrderDetails = ({route}: any) => {
  const {order} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={applyStyles('pb-md')}>
          <Text style={styles.itemTitle}>Amount</Text>
          <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
            {amountWithCurrency(order.amount)}
          </Text>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Type</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {order.deliveryType}
            </Text>
          </View>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Payment Method</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {order.paymentMethod}
            </Text>
          </View>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Order Placed</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {format(new Date(order.placedOn), 'MMM dd, yyyy')}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {format(new Date(order.placedOn), 'hh:mm:a')}
            </Text>
          </View>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Order Completed</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {format(new Date(order.completedOn), 'MMM dd, yyyy')}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {format(new Date(order.completedOn), 'hh:mm:a')}
            </Text>
          </View>
        </View>

        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Status</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {order.status}
            </Text>
          </View>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Location</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {order.location}
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

export default OrderDetails;
