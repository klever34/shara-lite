import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {applyStyles, amountWithCurrency} from '@/helpers/utils';
import {colors} from '@/styles';
import {IPayment} from '@/models/Payment';
import HeaderRight from '../../../components/HeaderRight';

export const CustomerCreditPaymentDetails = ({route}: any) => {
  const navigation = useNavigation();
  const {creditPaymentDetails}: {creditPaymentDetails: IPayment} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  return (
    <ScrollView persistentScrollbar={true} style={styles.container}>
      <View
        style={applyStyles('mb-xl pb-md', {
          borderBottomColor: colors['gray-20'],
          borderBottomWidth: 1,
        })}>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Customer</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditPaymentDetails?.customer?.name ||
                creditPaymentDetails.customer_name}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              {amountWithCurrency(creditPaymentDetails.amount_paid)}
            </Text>
          </View>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Paid on</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditPaymentDetails.created_at
                ? format(
                    new Date(creditPaymentDetails.created_at),
                    'MMM dd, yyyy',
                  )
                : ''}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {creditPaymentDetails.created_at
                ? format(new Date(creditPaymentDetails.created_at), 'hh:mm:a')
                : ''}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  item: {
    paddingBottom: 24,
  },
  itemTitle: {
    paddingBottom: 2,
    color: colors['gray-200'],
    textTransform: 'uppercase',
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
