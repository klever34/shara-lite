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
import {TextInput} from 'react-native-gesture-handler';
import {applyStyles} from '@/helpers/utils';
import {getContactService} from '@/services';
import {colors} from '@/styles';
import {Button} from './Button';
import Icon from './Icon';
import Touchable from './Touchable';
import {PhoneContact} from '@/services/contact';

type Props<T> = {
  visible: boolean;
  entity?: string;
  onClose: () => void;
  createdData?: T[];
  onAddNew?: () => void;
  onContactSelect?: (contact: PhoneContact) => void;
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
  const ref = useRef<{contacts: PhoneContact[]}>({contacts: []});
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      getContactService()
        .getPhoneContacts()
        .then((nextContacts) => {
          setIsLoading(false);
          ref.current.contacts = nextContacts;
          setContacts(nextContacts);
        })
        .catch((error: Error) => {
          setIsLoading(false);
          Alert.alert(
            '',
            error.message,
            [
              {
                text: 'OK',
              },
            ],
            {
              cancelable: false,
            },
          );
        });
    }, 500);
  }, [navigation, visible]);

  const handleClose = useCallback(() => {
    setSearchInputValue('');
    onClose();
  }, [onClose]);

  const handleSearch = useCallback((searchedText: string) => {
    setSearchInputValue(searchedText);
    if (searchedText) {
      const searchValue = searchedText.trim();
      const sort = (item: PhoneContact, text: string) => {
        const name = `${item.givenName} ${item.familyName}`;
        const mobile = item.phoneNumber.number;
        return (
          name.toLowerCase().indexOf(text.toLowerCase()) > -1 ||
          mobile.replace(/[\s-]+/g, '').indexOf(text) > -1
        );
      };
      const results = ref.current.contacts.filter((item: PhoneContact) => {
        return sort(item, searchValue);
      });
      setContacts(results);
    } else {
      setContacts(ref.current.contacts);
    }
  }, []);

  const handleContactSelect = useCallback(
    (contact: PhoneContact) => {
      onContactSelect && onContactSelect(contact);
      handleClose();
    },
    [handleClose, onContactSelect],
  );

  const handleAddNew = useCallback(() => {
    handleClose();
    onAddNew && onAddNew();
  }, [onAddNew, handleClose]);

  const renderContactItem = useCallback(
    ({item: contact}: ListRenderItemInfo<PhoneContact>) => {
      const contactMobile = contact.phoneNumber.number;
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
      onDismiss={handleClose}
      onRequestClose={handleClose}>
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

      {isLoading && !contacts.length ? (
        <View style={applyStyles('flex-1 items-center justify-center')}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={applyStyles('flex-1')}
          renderItem={renderContactItem}
          data={orderBy(contacts, 'givenName', 'asc')}
          ListHeaderComponent={renderContactListHeader}
          keyExtractor={(item: PhoneContact, index) =>
            `${item.recordID}-${index}`
          }
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
          onPress={handleClose}
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
