import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {colors} from '../../../styles';
import CreditPaymentForm from './CreditPaymentForm';
import {IPayment} from '../../../models/Payment';

const CreditPayment = ({route}: any) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const {creditDetails}: {creditDetails: IPayment} = route.params;

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
        <View style={applyStyles('pb-md')}>
          <Text style={styles.itemTitle}>Amount</Text>
          <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
            &#8358;{numberWithCommas(creditDetails.amount_paid)}
          </Text>
        </View>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Given On</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {format(new Date(creditDetails.created_at), 'MMM dd, yyyy')}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {format(new Date(creditDetails.created_at), 'hh:mm:a')}
            </Text>
          </View>
          <View style={applyStyles('pb-md', {width: '48%'})}>
            <Text style={styles.itemTitle}>Due On</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {format(new Date(creditDetails.created_at), 'MMM dd, yyyy')}
            </Text>
            <Text style={applyStyles(styles.itemDataSmall, 'text-400')}>
              {format(new Date(creditDetails.created_at), 'hh:mm:a')}
            </Text>
          </View>
        </View>
        <View style={applyStyles('pb-xl')}>
          <Text style={styles.itemTitle}>Given By</Text>
          <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>NA</Text>
        </View>
      </View>
      <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
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

export default CreditPayment;
