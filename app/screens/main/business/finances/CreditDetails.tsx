import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Modal} from 'react-native';
import {CreditPaymentForm} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
import {amountWithCurrency, applyStyles} from '../../../../helpers/utils';
import {ICredit} from '../../../../models/Credit';
import {saveCreditPayment} from '../../../../services/CreditPaymentService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import Touchable from '../../../../components/Touchable';
import Icon from '../../../../components/Icon';
import {ICustomer} from '../../../../models';
import {CustomersList} from '../receipts';

export const CreditDetails = ({route}: any) => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomersListModalOpen, setIsCustomersListModalOpen] = useState(
    false,
  );
  const [customer, setCustomer] = useState<ICustomer>({} as ICustomer);
  const {creditDetails}: {creditDetails: ICredit} = route.params;

  const handleOpenCustomersList = useCallback(() => {
    setIsCustomersListModalOpen(true);
  }, []);

  const handleCloseCustomersList = useCallback(() => {
    setIsCustomersListModalOpen(false);
  }, []);

  const handleCustomerSelect = useCallback(
    ({customer: customerData}) => {
      setCustomer(customerData);
    },
    [setCustomer],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleSubmit = useCallback(
    (payload, callback) => {
      if (creditDetails) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          saveCreditPayment({
            realm,
            ...payload,
            customer: creditDetails.customer || customer,
          });
          callback();
          navigation.navigate('Finances', {screen: 'Credit'});
        }, 300);
      }
    },
    [realm, customer, navigation, creditDetails],
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
              {creditDetails.customer?.name || customer.name || 'No customer'}
            </Text>
          </View>
          <View style={applyStyles('pb-sm', {width: '48%'})}>
            <Text style={styles.itemTitle}>Amount</Text>
            <Text style={applyStyles(styles.itemDataLarge, 'text-700')}>
              {amountWithCurrency(creditDetails.amount_left)}
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
          style={applyStyles('text-400 mb-lg', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Credit Payment
        </Text>
        <View style={applyStyles({marginBottom: 100})}>
          {!creditDetails.customer?.name && (
            <Touchable onPress={handleOpenCustomersList}>
              <View
                style={applyStyles('mb-sm flex-row py-lg items-center', {
                  borderBottomWidth: 1,
                  borderBottomColor: colors['gray-300'],
                })}>
                <Icon
                  size={24}
                  name="users"
                  type="feathericons"
                  color={colors['gray-50']}
                />
                <Text
                  style={applyStyles('pl-md text-400', {
                    fontSize: 18,
                    color: colors['gray-50'],
                  })}>
                  {customer.name ? 'Change customer' : 'Select customer'}
                </Text>
              </View>
            </Touchable>
          )}
          <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
        </View>
      </View>
      <Modal animationType="slide" visible={isCustomersListModalOpen}>
        <CustomersList
          onModalClose={handleCloseCustomersList}
          onCustomerSelect={handleCustomerSelect}
        />
      </Modal>
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
