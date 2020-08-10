import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {ScrollView, Text, View, Alert} from 'react-native';
import {Contact} from 'react-native-contacts';
import {
  Button,
  ContactsListModal,
  FloatingLabelInput,
} from '../../../../components';
import HeaderRight from '../../../../components/HeaderRight';
import Icon from '../../../../components/Icon';
import Touchable from '../../../../components/Touchable';
import {applyStyles} from '../../../../helpers/utils';
import {ISupplier} from '../../../../models/Supplier';
import {useRealm} from '../../../../services/realm';
import {saveSupplier, getSuppliers} from '../../../../services/SupplierService';
import {colors} from '../../../../styles';
import {getAnalyticsService} from '../../../../services';
import {useErrorHandler} from 'react-error-boundary';
import {useScreenRecord} from '../../../../services/analytics';

type Payload = Pick<ISupplier, 'name' | 'mobile' | 'address'>;

export const AddSupplier = () => {
  useScreenRecord();
  const realm = useRealm();
  const navigation = useNavigation();
  const suppliers = getSuppliers({realm});
  const [isLoading, setIsLoading] = useState(false);
  const [supplier, setSupplier] = useState<Payload>({} as Payload);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const handleSelectContact = useCallback(
    (contact: Contact) => {
      const {givenName, familyName, phoneNumbers} = contact;
      const contactName = `${givenName} ${familyName}`;
      const contactMobile = phoneNumbers[0].number;
      setSupplier({...supplier, name: contactName, mobile: contactMobile});
    },
    [supplier],
  );

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setSupplier({
        ...supplier,
        [key]: value,
      });
    },
    [supplier],
  );

  const clearForm = useCallback(() => {
    setSupplier({} as Payload);
  }, []);
  const handleError = useErrorHandler();

  const handleSubmit = useCallback(() => {
    if (supplier.name && supplier.mobile) {
      if (suppliers.map((item) => item.mobile).includes(supplier.mobile)) {
        Alert.alert(
          'Error',
          'Supplier with the same phone number has been created.',
        );
      } else {
        setIsLoading(true);
        setTimeout(() => {
          saveSupplier({realm, supplier});
          getAnalyticsService().logEvent('supplierAdded').catch(handleError);
          setIsLoading(false);
          clearForm();
          navigation.goBack();
        }, 300);
      }
    }
  }, [realm, clearForm, supplier, suppliers, navigation, handleError]);

  return (
    <View
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <Touchable onPress={handleOpenContactListModal}>
        <View
          style={applyStyles('flex-row px-lg py-lg items-center mb-xl', {
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <Icon
            size={24}
            name="user-plus"
            type="feathericons"
            color={colors.primary}
          />
          <Text
            style={applyStyles('text-400 pl-md', {
              fontSize: 16,
              color: colors['gray-300'],
            })}>
            Add From Phonebook
          </Text>
        </View>
      </Touchable>
      <ScrollView style={applyStyles('px-lg')}>
        <Text
          style={applyStyles('text-400', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Supplier Details
        </Text>
        <View style={applyStyles('flex-row', 'items-center')}>
          <FloatingLabelInput
            label="Name"
            value={supplier.name}
            onChangeText={(text) => handleChange(text, 'name')}
          />
        </View>
        <View style={applyStyles('flex-row', 'items-center')}>
          <FloatingLabelInput
            label="Address"
            value={supplier.address}
            onChangeText={(text) => handleChange(text, 'address')}
          />
        </View>
        <View style={applyStyles('flex-row', 'items-center')}>
          <FloatingLabelInput
            label="Phone number"
            value={supplier.mobile}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange(text, 'mobile')}
          />
        </View>
        <Button
          title="Add supplier"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={applyStyles({marginVertical: 48})}
        />
        <ContactsListModal
          visible={isContactListModalOpen}
          onClose={handleCloseContactListModal}
          onContactSelect={(contact) => handleSelectContact(contact)}
        />
      </ScrollView>
    </View>
  );
};
