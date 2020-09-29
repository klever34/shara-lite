import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns/esm';
import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {applyStyles, amountWithCurrency} from '@/helpers/utils';
import {colors} from '@/styles';
import {ActionCard} from '@/components';
import EmptyState from '../../../components/EmptyState';

const OrdersTab = () => {
  const navigation = useNavigation();

  const handleViewDetails = (order: any) => {
    navigation.navigate('OrderDetails', {order});
  };

  const renderOrderItem = ({item: order}: {item: any}) => {
    return (
      <View style={styles.creditItem}>
        <ActionCard
          buttonText="view details"
          onClick={() => handleViewDetails(order)}>
          <View style={applyStyles('pb-sm')}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              {amountWithCurrency(order.amount)}
            </Text>
          </View>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Type</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {order.deliveryType}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Payment Method</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {order.paymentMethod}
              </Text>
            </View>
          </View>
          <View style={applyStyles('flex-row', 'justify-space-between')}>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Order Placed</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {format(new Date(order.placedOn), 'MMM dd, yyyy')}
              </Text>
              <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
                {format(new Date(order.placedOn), 'hh:mm:a')}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
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
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Status</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {order.status}
              </Text>
            </View>
            <View style={applyStyles('pb-sm', {width: '48%'})}>
              <Text style={styles.itemTitle}>Location</Text>
              <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
                {order.location}
              </Text>
            </View>
          </View>
        </ActionCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            heading="Coming soon"
            style={applyStyles({marginTop: 32})}
            source={require('../../../assets/images/coming-soon.png')}
            text="We’re working on this page right now, it’ll be available shortly."
          />
        }
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

export default OrdersTab;
