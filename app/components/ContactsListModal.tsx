import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  ListRenderItemInfo,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Contact} from 'react-native-contacts';
import {TextInput} from 'react-native-gesture-handler';
import {applyStyles} from '../helpers/utils';
import {getContactsService} from '../services';
import {colors} from '../styles';
import {Button} from './Button';
import Icon from './Icon';
import Touchable from './Touchable';

type Props = {
  visible: boolean;
  onClose: () => void;
  onContactSelect?: (contact: Contact) => void;
};

export const ContactsListModal = ({
  visible,
  onClose,
  onContactSelect,
}: Props) => {
  const navigation = useNavigation();
  const ref = useRef<{contacts: Contact[]}>({contacts: []});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');

  useEffect(() => {
    const contactsService = getContactsService();
    contactsService
      .getAll()
      .then((nextContacts) => {
        const data = nextContacts.filter((contact) => {
          if (contact.phoneNumbers.length) {
            return {
              firstname: contact.givenName,
              lastname: contact.familyName,
              mobile: contact.phoneNumbers[0].number,
              fullName: `${contact.givenName} ${contact.familyName}`,
            };
          }
        });
        ref.current.contacts = data;
        setContacts(data);
      })
      .catch((error) => {
        Alert.alert(
          'Error',
          error.message,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
          {
            cancelable: false,
          },
        );
      });
  }, [navigation]);

  const handleSearch = useCallback(
    (searchedText: string) => {
      setSearchInputValue(searchedText);
      if (searchedText) {
        const sort = (item: Contact, text: string) => {
          return (
            `${item.givenName} ${item.familyName}`
              .toLowerCase()
              .indexOf(text.toLowerCase()) > -1
          );
        };
        var results = contacts.filter((item: Contact) => {
          return sort(item, searchedText);
        });
        setContacts(results);
      } else {
        setContacts(ref.current.contacts);
      }
    },
    [contacts],
  );

  const handleContactSelect = useCallback(
    (contact: Contact) => {
      onContactSelect && onContactSelect(contact);
      onClose();
    },
    [onClose, onContactSelect],
  );

  const renderContactItem = useCallback(
    ({item: contact}: ListRenderItemInfo<Contact>) => {
      return (
        <Touchable onPress={() => handleContactSelect(contact)}>
          <View
            style={applyStyles('flex-row items-center p-md', 'mx-lg', {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            })}>
            <View
              style={applyStyles('mr-md', {
                height: 48,
                width: 48,
                borderRadius: 24,
                backgroundColor: '#FFE2E2',
              })}
            />

            <Text style={applyStyles('text-400', 'text-lg')}>
              {contact.givenName} {contact.familyName}
            </Text>
          </View>
        </Touchable>
      );
    },
    [handleContactSelect],
  );

  return (
    <Modal animationType="slide" visible={visible}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            size={24}
            style={styles.searchInputIcon}
            type="feathericons"
            name="search"
            color={colors.primary}
          />
          <TextInput
            value={searchInputValue}
            onChangeText={handleSearch}
            placeholder="Search Contacts"
            placeholderTextColor={colors['gray-50']}
            style={applyStyles(styles.searchInput, 'text-400')}
          />
        </View>
      </View>

      <FlatList
        data={contacts}
        style={applyStyles('flex-1')}
        renderItem={renderContactItem}
        keyExtractor={(item: Contact) => item.recordID}
        ListEmptyComponent={
          <View
            style={applyStyles('flex-1', 'items-center', 'justify-center', {
              paddingVertical: 40,
            })}>
            <Text
              style={applyStyles('heading-700', 'text-center', {
                color: colors['gray-300'],
              })}>
              No results found
            </Text>
          </View>
        }
      />
      <View style={applyStyles('px-lg')}>
        <Button
          onPress={onClose}
          variantColor="clear"
          style={applyStyles({width: '100%', marginBottom: 24})}>
          <Text
            style={applyStyles('text-400', 'text-uppercase', {
              color: colors['gray-200'],
            })}>
            Cancel
          </Text>
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInputIcon: {
    top: 12,
    left: 10,
    elevation: 3,
    position: 'absolute',
  },
  searchInput: {
    height: 48,
    elevation: 2,
    fontSize: 16,
    borderRadius: 8,
    paddingLeft: 36,
    backgroundColor: colors.white,
  },
});
