import React, {useCallback, useLayoutEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import ContactsList from '../../../components/ContactsList';
import {IContact} from '../../../models/Contact';
import PlaceholderImage from '../../../components/PlaceholderImage';
import {applyStyles} from '../../../helpers/utils';
import Touchable from '../../../components/Touchable';
import {FAButton} from '../../../components';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '../index';
import HeaderTitle from '../../../components/HeaderTitle';
import {useScreenRecord} from '../../../services/analytics';

const SelectGroupMembersScreen = ({
  navigation,
  route,
}: StackScreenProps<MainStackParamList, 'SelectGroupMembers'>) => {
  useScreenRecord();
  const {participants, title, next} = route.params;
  const [selectedContacts, setSelectedContacts] = useState<IContact[]>([]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitle title={title} />,
    });
  });

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

  const isMember = useCallback(
    (contact: IContact) => {
      return !!participants?.filtered(`mobile = "${contact.mobile}"`)[0];
    },
    [participants],
  );

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <ContactsList
        onContactItemClick={toggleContactSelect}
        shouldClickContactItem={(item) => !isMember(item)}
        getContactItemDescription={(item) =>
          isMember(item) ? 'Already added to this group' : ''
        }
        getContactItemImageProps={(item) => ({
          indicator: selectedContacts.find(
            (selected) => selected.mobile === item.mobile,
          )
            ? {
                icon: {type: 'material-icons', name: 'check'},
                style: applyStyles('bg-green'),
              }
            : undefined,
        })}
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
                        indicator={{
                          style: applyStyles('bg-gray-200'),
                          icon: {
                            type: 'material-icons',
                            name: 'close',
                          },
                        }}
                      />
                    </View>
                  </Touchable>
                );
              })}
            </ScrollView>
          ) : null
        }
      />
      {!!selectedContacts.length && <FAButton {...next(selectedContacts)} />}
    </SafeAreaView>
  );
};

export default SelectGroupMembersScreen;
