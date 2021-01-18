import {ICustomer} from '@/models';
import {getAnalyticsService, getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {getCustomers, saveCustomer} from '@/services/customer';
import {useRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import orderBy from 'lodash/orderBy';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ListRenderItemInfo,
  SectionList,
  SectionListProps,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Button} from './Button';
import EmptyState from './EmptyState';
import Icon from './Icon';
import PlaceholderImage from './PlaceholderImage';
import Touchable from './Touchable';
import {ToastContext} from '@/components/Toast';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type Props<T> = {
  entity?: string;
  onClose: () => void;
  createdData?: T[];
  onAddNew?: () => void;
  onContactSelect?: (customer?: ICustomer) => void;
};

type CustomerListItem =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };

const ContactListItem = memo(
  ({
    customer,
    onItemSelect,
    onContactSelect,
  }: {
    customer: CustomerListItem;
    onItemSelect: (item: CustomerListItem) => void;
    onContactSelect: (item: CustomerListItem) => void;
  }) => (
    <Touchable
      onPress={
        '_id' in customer
          ? () => {
              getAnalyticsService().logEvent('selectContent', {
                item_id: String(customer._id),
                content_type: 'Customer',
              });
              return onItemSelect(customer);
            }
          : undefined
      }>
      <View
        style={applyStyles(
          'flex-row items-center border-b-1 border-gray-20 p-16',
        )}>
        <View style={applyStyles('flex-1 flex-row items-center')}>
          <PlaceholderImage text={customer?.name ?? ''} />
          <View style={applyStyles('pl-8')}>
            <Text style={applyStyles('text-sm text-700 text-gray-300')}>
              {customer.name}
            </Text>
            <Text style={applyStyles('text-sm text-400 text-gray-300')}>
              {customer.mobile}
            </Text>
          </View>
        </View>
        {'_id' in customer ? null : (
          <Touchable onPress={() => onContactSelect(customer)}>
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
  ),
);

const getPhoneContactsPromiseFn = () => getContactService().getPhoneContacts();

export function ContactsListModal<T>({
  onClose,
  entity,
  onAddNew,
  onContactSelect,
}: Props<T>) {
  const realm = useRealm() as Realm;
  const myCustomers = getCustomers({realm});
  const analyticsService = getAnalyticsService();

  const [searchInputValue, setSearchInputValue] = useState('');
  const [phoneContacts, setPhoneContacts] = useState<CustomerListItem[]>([]);

  const sectionData = useMemo(
    () => [
      {
        data: myCustomers.length
          ? orderBy(myCustomers, ['name'] as (keyof ICustomer)[], [
              'desc',
              'asc',
            ])
          : [],
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
  const [sections, setSections] = useState<SectionListProps<any>['sections']>(
    sectionData,
  );

  const {run: runGetPhoneContacts, loading} = useAsync(
    getPhoneContactsPromiseFn,
    {
      defer: true,
    },
  );

  const keyExtractor = useCallback((item) => {
    if (!item) {
      return '';
    }
    return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
  }, []);
  const {showSuccessToast} = useContext(ToastContext);
  const handleCreateCustomer = useCallback(
    (contact: CustomerListItem) => {
      const mobile = contact.mobile;
      const name = contact.name;
      const customer = {
        name,
        mobile,
      };
      saveCustomer({realm, customer, source: 'phonebook'});
      setPhoneContacts((prevPhoneContacts) => {
        return prevPhoneContacts.filter(
          (prevPhoneContact) => prevPhoneContact.mobile !== mobile,
        );
      });
      showSuccessToast('CUSTOMER ADDED');
    },
    [realm, showSuccessToast],
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

  const handleSearch = useCallback(
    (searchedText: string) => {
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
        const listToSearch = sectionData
          .map((item) => item.data)
          .reduce((acc, arr) => [...acc, ...arr], []);
        const results = listToSearch.filter((item) => {
          return sort(item, searchValue);
        });

        setSections([{data: results}]);
      } else {
        setSections(sectionData);
      }
    },
    [sectionData],
  );

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
        <ContactListItem
          customer={customer}
          onItemSelect={handleSelectCustomer}
          onContactSelect={handleContactSelect}
        />
      );
    },
    [handleContactSelect, handleSelectCustomer],
  );

  const renderCustomerListSectionHeader = useCallback(
    ({section: {title}}) => {
      if (!title) {
        return null;
      }
      if (loading) {
        return (
          <View style={styles.customerListHeader}>
            <ActivityIndicator size={24} color={colors.primary} />
          </View>
        );
      }
      return <Text style={styles.customerListHeader}>{title}</Text>;
    },
    [loading],
  );

  useEffect(() => {
    const customers = getCustomers({realm});
    runGetPhoneContacts().then((contacts) => {
      const data = contacts.reduce<CustomerListItem[]>(
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
      );
      setPhoneContacts(data);
      setSections([
        {
          data: myCustomers.length
            ? orderBy(myCustomers, ['name'] as (keyof ICustomer)[], [
                'desc',
                'asc',
              ])
            : [],
        },
        {
          title: 'Add from your phonebook',
          data: orderBy(data, ['name'] as (keyof CustomerListItem)[], ['asc']),
        },
      ]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <SectionList
        sections={sections}
        persistentScrollbar
        initialNumToRender={10}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="always"
        renderItem={renderCustomerListItem}
        renderSectionHeader={renderCustomerListSectionHeader}
        ListHeaderComponent={
          <View style={applyStyles('bg-white')}>
            <View
              style={applyStyles(
                'py-md px-lg flex-row items-center justify-between',
                {
                  borderBottomWidth: 1,
                  borderBottomColor: colors['gray-20'],
                },
              )}>
              <View style={applyStyles({width: '48%'})}>
                <Text style={applyStyles('text-700 text-xs text-uppercase')}>
                  Select a Customer
                </Text>
              </View>
              <View style={applyStyles({width: '48%'})}>
                {onAddNew && (
                  <Button onPress={handleAddNew}>
                    <View style={applyStyles('flex-row px-sm items-center')}>
                      <Icon
                        size={16}
                        name="plus"
                        type="feathericons"
                        color={colors.white}
                      />
                      <Text
                        style={applyStyles('pl-4 text-700 text-xs', {
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
          </View>
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
              {strings('result', {count: 0})}
            </Text>
          </View>
        }
        ListFooterComponent={
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
                {strings('close')}
              </Text>
            </Button>
          </View>
        }
      />
    </View>
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
