import {ContactsListModal} from '@/components';
import EmptyState from '@/components/EmptyState';
import {HeaderRight} from '@/components/HeaderRight';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {applyStyles} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getAnalyticsService, getContactService} from '@/services';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import {useNavigation} from '@react-navigation/native';
import orderBy from 'lodash/orderBy';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  ListRenderItemInfo,
  SectionList,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';

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

type CustomersScreenProps = ModalWrapperFields & {};

export const CustomersScreen = withModal(
  ({openModal}: CustomersScreenProps) => {
    const navigation = useNavigation();
    const realm = useRealm() as Realm;
    const myCustomers = getCustomers({realm});
    const analyticsService = getAnalyticsService();
    const [isContactListModalOpen, setIsContactListModalOpen] = useState(false);
    const [phoneContacts, setPhoneContacts] = useState<CustomerListItem[]>([]);
    useEffect(() => {
      const customers = getCustomers({realm});
      getContactService()
        .getPhoneContacts()
        .then((contacts) => {
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

    const handleCloseContactListModal = useCallback(() => {
      setIsContactListModalOpen(false);
    }, []);

    const handleSelectCustomer = useCallback(
      (item?: ICustomer) => {
        analyticsService
          .logEvent('selectContent', {
            item_id: item?._id?.toString() ?? '',
            content_type: 'customer',
          })
          .then(() => {});
        navigation.navigate('CustomerDetails', {customer: item});
      },
      [navigation, analyticsService],
    );

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

    const renderCustomerListItem = useCallback(
      ({
        item: customer,
      }: Pick<ListRenderItemInfo<CustomerListItem | null>, 'item'>) => {
        if (!customer) {
          return (
            <EmptyState
              heading="You don't have any customers on Shara yet"
              text="Add a new customer from the list below"
              source={require('../../../assets/images/coming-soon.png')}
            />
          );
        }
        return (
          <Touchable
            onPress={
              '_id' in customer
                ? () => handleSelectCustomer(customer)
                : undefined
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
              {'_id' in customer ? (
                !!customer.remainingCreditAmount && (
                  <View>
                    <Text
                      style={applyStyles(
                        'text-sm text-700',
                        customer.overdueCreditAmount
                          ? 'text-primary'
                          : 'text-gray-300',
                      )}>
                      {customer.remainingCreditAmount}
                    </Text>
                  </View>
                )
              ) : (
                <Touchable
                  onPress={() => {
                    handleCreateCustomer(customer);
                  }}>
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
      [handleCreateCustomer, handleSelectCustomer],
    );

    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            options={[
              {
                icon: 'search',
                onPress: () => {
                  openModal('search', {
                    items: (myCustomers as unknown) as ICustomer[],
                    renderItem: ({item}) => {
                      return renderCustomerListItem({
                        item: item as CustomerListItem,
                      });
                    },
                    setSort: () => {},
                    textInputProps: {placeholder: 'Search Customers'},
                  });
                },
              },
            ]}
            menuOptions={[]}
          />
        ),
      });
    }, [myCustomers, navigation, openModal, renderCustomerListItem]);

    const renderCustomerListSectionHeader = useCallback(
      ({section: {title}}) => {
        if (!title) {
          return null;
        }
        return <Text style={styles.customerListHeader}>{title}</Text>;
      },
      [],
    );
    const sections = useMemo(
      () => [
        {
          data: myCustomers.length
            ? orderBy(
                myCustomers,
                ['debtLevel', 'name'] as (keyof ICustomer)[],
                ['desc', 'asc'],
              )
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
    const onContactSelect = useCallback(
      (contact?: ICustomer) => contact && handleCreateCustomer(contact),
      [handleCreateCustomer],
    );
    const keyExtractor = useCallback((item) => {
      if (!item) {
        return '';
      }
      return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
    }, []);

    return (
      <View style={styles.container}>
        <Touchable onPress={() => navigation.navigate('AddCustomer')}>
          <View
            style={applyStyles(
              'flex-row items-center py-16 px-16 border-b-1 border-gray-20',
            )}>
            <Icon
              size={24}
              name="plus"
              type="feathericons"
              style={applyStyles('mr-8')}
              color={colors.primary}
            />
            <Text style={applyStyles('text-sm text-primary uppercase')}>
              Create Customer
            </Text>
          </View>
        </Touchable>
        <SectionList
          renderItem={renderCustomerListItem}
          renderSectionHeader={renderCustomerListSectionHeader}
          keyExtractor={keyExtractor}
          sections={sections}
        />
        <ContactsListModal<ICustomer>
          entity="Customer"
          createdData={(myCustomers as unknown) as ICustomer[]}
          visible={isContactListModalOpen}
          onClose={handleCloseContactListModal}
          onAddNew={() => navigation.navigate('AddCustomer')}
          onContactSelect={onContactSelect}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
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
  customerListHeader: applyStyles('text-center bg-gray-10', {
    fontSize: 12,
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

export * from './AddCustomer';
