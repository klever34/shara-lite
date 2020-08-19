import {useNavigation} from '@react-navigation/native';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

type Props<T> = {
  visible: boolean;
  entity?: string;
  onClose: () => void;
  createdData?: T[];
  onAddNew?: () => void;
  onContactSelect?: (contact: Contact) => void;
};

export function ContactsListModal<T>({
  visible,
  onClose,
  entity,
  onAddNew,
  createdData,
  onContactSelect,
}: Props<T>) {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<{contacts: Contact[]}>({contacts: []});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const contactsService = getContactsService();
    contactsService
      .getAll()
      .then((nextContacts) => {
        setIsLoading(false);
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
        setIsLoading(false);
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

  const handleAddNew = useCallback(() => {
    onClose();
    onAddNew && onAddNew();
  }, [onAddNew, onClose]);

  const renderContactItem = useCallback(
    ({item: contact}: ListRenderItemInfo<Contact>) => {
      const contactMobile =
        contact.phoneNumbers && contact.phoneNumbers[0]
          ? contact.phoneNumbers[0].number
          : '';
      const isAdded =
        createdData &&
        createdData.map((item: any) => item.mobile).includes(contactMobile);
      return (
        <Touchable onPress={() => handleContactSelect(contact)}>
          <View
            style={applyStyles(
              'mx-lg flex-row items-center p-md justify-space-between',
              {
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <View style={applyStyles('flex-row items-center')}>
              {contact.hasThumbnail ? (
                <Image
                  style={applyStyles('mr-md', {
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    backgroundColor: '#FFE2E2',
                  })}
                  source={{uri: contact.thumbnailPath}}
                />
              ) : (
                <View
                  style={applyStyles('mr-md items-center justify-center', {
                    height: 48,
                    width: 48,
                    borderRadius: 24,
                    backgroundColor: '#FFE2E2',
                  })}>
                  <Text
                    style={applyStyles('text-center text-500', {
                      color: colors.primary,
                      fontSize: 12,
                    })}>
                    {contact.givenName[0]}
                    {contact.familyName[0]}
                  </Text>
                </View>
              )}

              <Text style={applyStyles('text-400', 'text-lg')}>
                {contact.givenName} {contact.familyName}
              </Text>
            </View>
            {isAdded && (
              <View>
                <Text
                  style={applyStyles('text-400', {
                    fontSize: 12,
                    color: colors['gray-50'],
                  })}>
                  Already Added
                </Text>
              </View>
            )}
          </View>
        </Touchable>
      );
    },
    [createdData, handleContactSelect],
  );

  const renderContactListHeader = useCallback(
    () => (
      <Text style={applyStyles(styles.customerListHeader, 'text-500')}>
        Select a contact
      </Text>
    ),
    [],
  );

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onDismiss={onClose}
      onRequestClose={onClose}>
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
      {onAddNew && (
        <Touchable onPress={handleAddNew}>
          <View
            style={applyStyles('flex-row px-lg py-lg items-center', {
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
              Add New {entity}
            </Text>
          </View>
        </Touchable>
      )}

      {isLoading ? (
        <View style={applyStyles('flex-1 items-center justify-center')}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={applyStyles('flex-1')}
          renderItem={renderContactItem}
          data={orderBy(contacts, 'givenName', 'asc')}
          ListHeaderComponent={renderContactListHeader}
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
      )}
      <View>
        <Button
          onPress={onClose}
          variantColor="clear"
          style={applyStyles({
            width: '100%',
            borderTopWidth: 1,
            borderTopColor: colors['gray-20'],
          })}>
          <Text
            style={applyStyles('text-400', 'text-uppercase', {
              color: colors.primary,
            })}>
            Close
          </Text>
        </Button>
      </View>
    </Modal>
  );
}

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
  customerListHeader: {
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    color: colors['gray-300'],
    borderBottomColor: colors['gray-20'],
  },
});
