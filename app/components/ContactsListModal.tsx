import {applyStyles} from '@/helpers/utils';
import BottomHalfModal from '@/modals/BottomHalfModal';
import {getContactService} from '@/services';
import {PhoneContact} from '@/services/contact';
import {colors} from '@/styles';
import {useNavigation} from '@react-navigation/native';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {Button} from './Button';
import Icon from './Icon';
import Touchable from './Touchable';

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

  return (
    <BottomHalfModal
      visible={visible}
      closeModal={handleClose}
      renderContent={({closeModal}) => (
        <View>
          {isLoading && !contacts.length ? (
            <View style={applyStyles('items-center justify-center')}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <FlatList
              renderItem={renderContactItem}
              data={orderBy(contacts, 'givenName', 'asc')}
              keyExtractor={(item: PhoneContact, index) =>
                `${item.recordID}-${index}`
              }
              ListHeaderComponent={
                <>
                  <View
                    style={applyStyles(
                      'py-md px-lg flex-row items-center justify-space-between',
                      {
                        borderBottomWidth: 1,
                        borderBottomColor: colors['gray-20'],
                      },
                    )}>
                    <View style={applyStyles({width: '48%'})}>
                      <Text style={applyStyles('text-700 text-uppercase')}>
                        Select a Customer
                      </Text>
                    </View>
                    <View style={applyStyles({width: '48%'})}>
                      {onAddNew && (
                        <Button onPress={handleAddNew}>
                          <View
                            style={applyStyles('flex-row px-sm items-center')}>
                            <Icon
                              size={16}
                              name="plus"
                              type="feathericons"
                              color={colors.white}
                            />
                            <Text
                              style={applyStyles('text-400 text-uppercase ', {
                                color: colors.white,
                              })}>
                              Create {entity}
                            </Text>
                          </View>
                        </Button>
                      )}
                    </View>
                  </View>
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
                        placeholder="Search for customer here..."
                        placeholderTextColor={colors['gray-50']}
                        style={applyStyles(styles.searchInput, 'text-400')}
                      />
                    </View>
                  </View>
                </>
              }
              ListEmptyComponent={
                <View
                  style={applyStyles('items-center', 'justify-center', {
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
              onPress={closeModal}
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
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors['gray-20'],
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
