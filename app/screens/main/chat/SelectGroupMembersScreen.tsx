import React, {useCallback, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import ContactsList from '../../../components/ContactsList';
import {IContact} from '../../../models';
import PlaceholderImage from '../../../components/PlaceholderImage';
import {applyStyles} from '../../../helpers/utils';
import Touchable from '../../../components/Touchable';
import {FAButton} from '../../../components';
import {useNavigation} from '@react-navigation/native';

const SelectGroupMembersScreen = () => {
  const navigation = useNavigation();
  const [selectedContacts, setSelectedContacts] = useState<IContact[]>([]);
  const toggleContactSelect = useCallback((item: IContact) => {
    setSelectedContacts((prevSelectedContacts) => {
      const index = prevSelectedContacts.findIndex(
        ({mobile}) => mobile === item.mobile,
      );
      if (index > -1) {
        return [
          ...prevSelectedContacts.slice(0, index),
          ...prevSelectedContacts.slice(index + 1),
        ];
      }
      return [...prevSelectedContacts, item];
    });
  }, []);

  const next = useCallback(() => {
    navigation.navigate('SetGroupDetails', {members: selectedContacts});
  }, [navigation, selectedContacts]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <ContactsList
        onContactItemClick={toggleContactSelect}
        ListHeaderComponent={
          selectedContacts.length ? (
            <ScrollView horizontal style={applyStyles('mx-md')}>
              {selectedContacts.map((contact) => {
                return (
                  <Touchable
                    key={contact.mobile}
                    onPress={() => {
                      toggleContactSelect(contact);
                    }}>
                    <View>
                      <PlaceholderImage
                        text={contact.fullName}
                        style={applyStyles('m-sm')}
                      />
                    </View>
                  </Touchable>
                );
              })}
            </ScrollView>
          ) : null
        }
      />
      {!!selectedContacts.length && (
        <FAButton iconName="arrow-forward" onPress={next} />
      )}
    </SafeAreaView>
  );
};

export default SelectGroupMembersScreen;
