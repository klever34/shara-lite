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
import {IDeliveryAgent} from '../../../../models/DeliveryAgent';
import {
  saveDeliveryAgent,
  getDeliveryAgents,
} from '../../../../services/DeliveryAgentService';
import {useRealm} from '../../../../services/realm';
import {colors} from '../../../../styles';

type Payload = Pick<IDeliveryAgent, 'full_name' | 'mobile'>;

export const AddDeliveryAgent = () => {
  const realm = useRealm();
  const navigation = useNavigation();
  const deliveryAgents = getDeliveryAgents({realm});
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryAgent, setDeliveryAgent] = useState<Payload>({} as Payload);
  const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [navigation]);

  const handleChange = useCallback(
    (value: string | number, key: keyof Payload) => {
      setDeliveryAgent({
        ...deliveryAgent,
        [key]: value,
      });
    },
    [deliveryAgent],
  );

  const handleSelectContact = useCallback((contact: Contact) => {
    const {givenName, familyName, phoneNumbers} = contact;
    const contactName = `${givenName} ${familyName}`;
    const contactMobile = phoneNumbers[0].number;
    setDeliveryAgent({full_name: contactName, mobile: contactMobile});
  }, []);

  const handleOpenContactListModal = useCallback(() => {
    setIsContactListModalOpen(true);
  }, []);

  const handleCloseContactListModal = useCallback(() => {
    setIsContactListModalOpen(false);
  }, []);

  const clearForm = useCallback(() => {
    setDeliveryAgent({} as Payload);
  }, []);

  const handleSubmit = useCallback(() => {
    if (
      deliveryAgents.map((item) => item.mobile).includes(deliveryAgent.mobile)
    ) {
      Alert.alert(
        'Error',
        'Delivery Agent with the same phone number has been created.',
      );
    } else {
      setIsLoading(true);
      setTimeout(() => {
        saveDeliveryAgent({realm, delivery_agent: deliveryAgent});
        setIsLoading(false);
        clearForm();
        navigation.goBack();
      }, 300);
    }
  }, [realm, clearForm, deliveryAgent, deliveryAgents, navigation]);

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
          style={applyStyles('text-400 pb-lg', {
            fontSize: 18,
            color: colors.primary,
          })}>
          Delivery Agent Details
        </Text>
        <View style={applyStyles('flex-row pb-xl items-center')}>
          <FloatingLabelInput
            label="Name"
            value={deliveryAgent.full_name}
            onChangeText={(text) => handleChange(text, 'full_name')}
          />
        </View>
        <View style={applyStyles('flex-row pb-xl items-center')}>
          <FloatingLabelInput
            label="Phone number (optional)"
            value={deliveryAgent.mobile}
            keyboardType="phone-pad"
            onChangeText={(text) => handleChange(text, 'mobile')}
          />
        </View>
        <Button
          isLoading={isLoading}
          onPress={handleSubmit}
          title="Add delivery agent"
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
