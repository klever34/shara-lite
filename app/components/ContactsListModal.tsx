import {applyStyles} from '@/helpers/utils';
import BottomHalfModal from '@/modals/BottomHalfModal';
import {ICustomer} from '@/models';
import {getAnalyticsService, getContactService} from '@/services';
import {getCustomers, saveCustomer} from '@/services/customer';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  ListRenderItemInfo,
  SectionList,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {Button} from './Button';
import EmptyState from './EmptyState';
import Icon from './Icon';
import Touchable from './Touchable';

type Props<T> = {
  visible: boolean;
  entity?: string;
  onClose: () => void;
  createdData?: T[];
  onAddNew?: () => void;
  onContactSelect?: (customer?: ICustomer) => void;
};

type CustomerListItem =
  | Pick<
      ICustomer,
      | 'name'
      | 'mobile'
      | 'remainingCreditAmount'
      | 'overdueCreditAmount'
      | '_id'
    >
  | {
      name: string;
      mobile?: string;
    };

export function ContactsListModal<T>({
  visible,
  onClose,
  entity,
  onAddNew,
  onContactSelect,
}: Props<T>) {
  const realm = useRealm() as Realm;
  const myCustomers = getCustomers({realm});
  const analyticsService = getAnalyticsService();

  const ref = useRef<{contacts: ICustomer[]}>({contacts: []});
  const [isLoading, setIsLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [phoneContacts, setPhoneContacts] = useState<CustomerListItem[]>([]);

  const sections = useMemo(
    () => [
      {
        data: myCustomers.length
          ? orderBy(myCustomers, ['debtLevel', 'name'] as (keyof ICustomer)[], [
              'desc',
              'asc',
            ])
          : [null],
      },
      {
        title: 'Add from your phonebook',
        data: orderBy(phoneContacts, ['name'] as (keyof CustomerListItem)[], [
          'asc',
        ]),
      },
    ],
    [myCustomers, phoneContacts],
  );

  const keyExtractor = useCallback((item) => {
    if (!item) {
      return '';
    }
    return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
  }, []);

  const handleCreateCustomer = useCallback(
    (contact: CustomerListItem) => {
      const mobile = contact.mobile;
      const name = contact.name;
      const customer = {
        name,
        mobile,
      };
      saveCustomer({realm, customer});
      setPhoneContacts((prevPhoneContacts) => {
        return prevPhoneContacts.filter(
          (prevPhoneContact) => prevPhoneContact.mobile !== mobile,
        );
      });
      ToastAndroid.show('Customer added', ToastAndroid.SHORT);
    },
    [realm],
  );

  const handleSelectCustomer = useCallback(
    (item?: ICustomer) => {
      analyticsService
        .logEvent('selectContent', {
          item_id: item?._id?.toString() ?? '',
          content_type: 'customer',
        })
        .then(() => {});
      onContactSelect && onContactSelect(item);
    },
    [analyticsService, onContactSelect],
  );

  const handleContactSelect = useCallback(
    (customer: ICustomer) => {
      handleCreateCustomer(customer);
      onContactSelect && onContactSelect(customer);
    },
    [handleCreateCustomer, onContactSelect],
  );

  const handleClose = useCallback(() => {
    setSearchInputValue('');
    onClose();
  }, [onClose]);

  const handleAddNew = useCallback(() => {
    handleClose();
    onAddNew && onAddNew();
  }, [onAddNew, handleClose]);

  const handleSearch = useCallback((searchedText: string) => {
    setSearchInputValue(searchedText);
    if (searchedText) {
      const searchValue = searchedText.trim();
      const sort = (item: ICustomer, text: string) => {
        const name = item.name;
        const mobile = item.mobile;
        return (
          name.toLowerCase().indexOf(text.toLowerCase()) > -1 ||
          (mobile && mobile.replace(/[\s-]+/g, '').indexOf(text) > -1)
        );
      };
      const results = ref.current.contacts.filter((item: ICustomer) => {
        return sort(item, searchValue);
      });
      setPhoneContacts(results);
    } else {
      setPhoneContacts(ref.current.contacts);
    }
  }, []);

  const renderCustomerListItem = useCallback(
    ({item: customer}: ListRenderItemInfo<CustomerListItem | null>) => {
      if (!customer) {
        return (
          <EmptyState
            heading="You don't have any customers on Shara yet"
            text="Add a new customer from the list below"
            source={require('../assets/images/coming-soon.png')}
          />
        );
      }
      return (
        <Touchable
          onPress={
            '_id' in customer ? () => handleSelectCustomer(customer) : undefined
          }>
          <View
            style={applyStyles(
              'flex-row items-center border-b-1 border-gray-20 p-16',
            )}>
            <View style={applyStyles('flex-1')}>
              <Text style={applyStyles('text-sm text-700 text-gray-300')}>
                {customer.name}
              </Text>
              <Text style={applyStyles('text-sm text-400 text-gray-300')}>
                {customer.mobile}
              </Text>
            </View>
            {'_id' in customer ? null : (
              <Touchable onPress={() => handleContactSelect(customer)}>
                <View
                  style={applyStyles(
                    'flex-row items-center bg-red-200 rounded-4 py-4 px-8',
                  )}>
                  <Icon
                    type="feathericons"
                    name="plus"
                    style={applyStyles('text-white mr-4')}
                    size={14}
                  />
                  <Text style={applyStyles('text-white text-400')}>Add</Text>
                </View>
              </Touchable>
            )}
          </View>
        </Touchable>
      );
    },
    [handleContactSelect, handleSelectCustomer],
  );

  const renderCustomerListSectionHeader = useCallback(({section: {title}}) => {
    if (!title) {
      return null;
    }
    return <Text style={styles.customerListHeader}>{title}</Text>;
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const customers = getCustomers({realm});
    getContactService()
      .getPhoneContacts()
      .then((contacts) => {
        setIsLoading(false);
        setPhoneContacts(
          contacts.reduce<CustomerListItem[]>(
            (acc, {givenName, familyName, phoneNumber}) => {
              const existing = customers.filtered(
                `mobile = "${phoneNumber.number}"`,
              );
              if (existing.length) {
                return acc;
              }
              return [
                ...acc,
                {
                  name: `${givenName} ${familyName}`,
                  mobile: phoneNumber.number,
                },
              ];
            },
            [],
          ),
        );
      });
  }, [realm]);

  return (
    <BottomHalfModal
      visible={visible}
      closeModal={handleClose}
      renderContent={({closeModal}) => (
        <View>
          {isLoading ? (
            <View style={applyStyles('py-96 items-center justify-center')}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <SectionList
              sections={sections}
              initialNumToRender={10}
              keyExtractor={keyExtractor}
              renderItem={renderCustomerListItem}
              renderSectionHeader={renderCustomerListSectionHeader}
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
  customerListHeader: applyStyles('text-center bg-gray-10', {
    fontWeight: 'bold',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    textTransform: 'uppercase',
    color: colors['gray-300'],
    fontFamily: 'Rubik-Regular',
    borderBottomColor: colors['gray-20'],
  }),
});
