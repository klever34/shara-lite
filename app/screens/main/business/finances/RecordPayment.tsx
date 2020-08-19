import {useNavigation} from '@react-navigation/native';
import {uniqBy} from 'lodash';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ToastAndroid,
} from 'react-native';
import {CreditPaymentForm} from '../../../../components';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {ICustomer} from '../../../../models';
import {saveCreditPayment} from '../../../../services/CreditPaymentService';
import {getCredits} from '../../../../services/CreditService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';
import {CustomersList} from '../receipts';
import {useScreenRecord} from '../../../../services/analytics';

export const RecordCreditPayment = () => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomersListModalOpen, setIsCustomersListModalOpen] = useState(
    false,
  );
  const [customer, setCustomer] = useState<ICustomer>({} as ICustomer);
  const credits = getCredits({realm});
  const customers = credits
    .filter((item) => !item.fulfilled)
    .filter((item) => item.customer)
    .map((item) => item.customer) as ICustomer[];
  const creditCustomers = uniqBy(customers, '_id');

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

  const handleSubmit = useCallback(
    (payload, callback) => {
      if (customer.name) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          saveCreditPayment({realm, customer, ...payload});
          callback();
          navigation.goBack();
          ToastAndroid.show('Credit payment recorded', ToastAndroid.SHORT);
        }, 300);
      } else {
        Alert.alert('Info', 'Please select a customer');
      }
    },
    [realm, customer, navigation],
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="always">
      {!!customer.name && (
        <View style={applyStyles('mb-lg')}>
          <Text
            style={applyStyles('pb-md text-400 text-uppercase', {
              color: colors.primary,
            })}>
            Customer details
          </Text>
          <Text
            style={applyStyles('pb-sm text-400 text-uppercase', {
              fontSize: 18,
              color: colors['gray-300'],
            })}>
            {customer.name}
          </Text>
          <Text
            style={applyStyles('pb-sm text-400', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            {customer.mobile}
          </Text>
        </View>
      )}
      <Touchable onPress={handleOpenCustomersList}>
        <View
          style={applyStyles('mb-lg flex-row py-lg items-center', {
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
              color: colors['gray-100'],
            })}>
            {customer.name ? 'Change customer' : 'Select customer'}
          </Text>
        </View>
      </Touchable>
      <CreditPaymentForm isLoading={isLoading} onSubmit={handleSubmit} />
      <Modal
        animationType="slide"
        visible={isCustomersListModalOpen}
        onDismiss={handleCloseCustomersList}
        onRequestClose={handleCloseCustomersList}>
        <CustomersList
          showAddFromPhone={false}
          customers={creditCustomers}
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
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
});
