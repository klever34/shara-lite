import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {applyStyles, numberWithCommas} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {CreditPaymentForm} from '../../../../components';
import {ICreditPayment} from '../../../../models/CreditPayment';

export const CreditDetails = ({route}: any) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const {creditDetails}: {creditDetails: ICreditPayment} = route.params;

  const handleSubmit = useCallback(
    (payload, callback) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        console.log({...payload, ...creditDetails});
        callback();
        navigation.goBack();
      }, 300);
    },
    [navigation, creditDetails],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Customer</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.credit.customer_name}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              &#8358;{numberWithCommas(creditDetails.credit.amount_left)}
            </Text>
          </View>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Given on</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'MMM dd, yyyy')
                : ''}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'hh:mm:a')
                : ''}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Due on</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'MMM dd, yyyy')
                : ''}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {creditDetails.created_at
                ? format(new Date(creditDetails.created_at), 'hh:mm:a')
                : ''}
            </Text>
          </View>
        </View>
      </View>
      <View>
        <Text
          style={applyStyles('text-400', {
            fontSize: 16,
            color: colors.primary,
          })}>
          Credit Payment
        </Text>
        <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
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
