import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {CreditPaymentForm} from '../../../components';
import AppMenu from '../../../components/Menu';
import {applyStyles, numberWithCommas} from '../../../helpers/utils';
import {ICredit} from '../../../models/Credit';
import {colors} from '../../../styles';
import {useRealm} from '../../../services/realm';
import {saveCreditPayment} from '../../../services/CreditPaymentService';

const CreditPayment = ({route}: any) => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const {creditDetails}: {creditDetails: ICredit} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppMenu options={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleSubmit = useCallback(
    (payload, callback) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        saveCreditPayment({
          realm,
          ...payload,
          customer: creditDetails.customer,
        });
        callback();
        navigation.goBack();
      }, 300);
    },
    [realm, creditDetails.customer, navigation],
  );

  return (
    <ScrollView style={styles.container}>
      <View
        style={applyStyles('mb-xl pb-md', {
          borderBottomColor: colors['gray-20'],
          borderBottomWidth: 1,
        })}>
        <View style={applyStyles('flex-row', 'justify-space-between')}>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Customer</Text>
            <Text style={applyStyles(styles.itemDataMedium, 'text-400')}>
              {creditDetails.customer_name}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              &#8358;{numberWithCommas(creditDetails.amount_left)}
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
            <Text
              style={applyStyles(styles.itemDataMedium, 'text-400', {
                color: colors.primary,
              })}>
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
            fontSize: 18,
            color: colors.primary,
          })}>
          Credit Payment
        </Text>
        <View style={applyStyles({marginBottom: 100})}>
          <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
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

export default CreditPayment;
