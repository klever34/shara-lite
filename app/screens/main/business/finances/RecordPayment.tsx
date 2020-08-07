import React, {useState, useCallback} from 'react';
import {ScrollView, StyleSheet, Modal, View, Text} from 'react-native';
import {CreditPaymentForm} from '../../../../components';
import {useNavigation} from '@react-navigation/native';
import {saveCreditPayment} from '../../../../services/CreditPaymentService';
import {useRealm} from '../../../../services/realm';
import {ICustomer} from '../../../../models';
import {CustomersList, CustomerDetailsModal} from '../receipts';
import Touchable from '../../../../components/Touchable';
import Icon from '../../../../components/Icon';
import {applyStyles} from '../../../../helpers/utils';
import {colors} from '../../../../styles';
import {ContactsListModal} from '../../../../components/ContactsListModal';

export const RecordCreditPayment = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomersListModalOpen, setIsCustomersListModalOpen] = useState(
    false,
  );
  const [customer, setCustomer] = useState<ICustomer>({} as ICustomer);

  const handleOpenCustomersList = useCallback(() => {
    setIsCustomersListModalOpen(true);
  }, []);

  const handleCloseCustomersList = useCallback(() => {
    setIsCustomersListModalOpen(false);
  }, []);

  const handleOpenCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(true);
  }, []);

  const handleCloseCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(false);
  }, []);

  const handleCustomerSelect = useCallback(
    ({customer: customerData}) => {
      setCustomer(customerData);
    },
    [setCustomer],
  );

  const handleSetCustomer = useCallback((value: ICustomer) => {
    setCustomer(value);
  }, []);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
    handleCloseCustomerModal();
    handleCloseCustomersList();
  }, [handleCloseCustomerModal, handleCloseCustomersList]);

  const handleSubmit = useCallback(
    (payload, callback) => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        saveCreditPayment({realm, customer, ...payload});
        callback();
        navigation.goBack();
      }, 300);
    },
    [realm, customer, navigation],
  );

  return (
    <ScrollView style={styles.container}>
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
      <Touchable onPress={handleOpenCustomerModal}>
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
      <Modal animationType="slide" visible={isCustomersListModalOpen}>
        <CustomersList
          onModalClose={handleCloseCustomersList}
          onCustomerSelect={handleCustomerSelect}
          onOpenContactList={handleOpenContactListModal}
        />
      </Modal>
      <CustomerDetailsModal
        customer={customer}
        visible={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSelectCustomer={handleSetCustomer}
        onOpenCustomerList={handleOpenCustomersList}
      />
      <ContactsListModal
        visible={isContactListModalOpen}
        onClose={handleCloseContactListModal}
        onContactSelect={({givenName, familyName, phoneNumbers}) =>
          handleSetCustomer({
            name: `${givenName} ${familyName}`,
            mobile: phoneNumbers[0].number,
          })
        }
      />
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
