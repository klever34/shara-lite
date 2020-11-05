import EmptyState from '@/components/EmptyState';
import {HeaderRight, HeaderRightMenuOption} from '@/components/HeaderRight';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency, prepareValueForSearch} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getAnalyticsService, getContactService} from '@/services';
import {useAsync} from '@/services/api';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import orderBy from 'lodash/orderBy';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import {applyStyles} from '@/styles';
import {HomeContainer} from '@/components';
import PlaceholderImage from '@/components/PlaceholderImage';
import {getSummary, IFinanceSummary} from '@/services/FinanceService';

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
const getPhoneContactsPromiseFn = () => getContactService().getPhoneContacts();
export const CustomerListScreen = withModal(
  ({openModal, closeModal}: CustomersScreenProps) => {
    const navigation = useAppNavigation();
    const realm = useRealm() as Realm;
    const myCustomers = getCustomers({realm});
    const analyticsService = getAnalyticsService();
    const [phoneContacts, setPhoneContacts] = useState<CustomerListItem[]>([]);

    const financeSummary: IFinanceSummary = getSummary({realm});

    const {run: runGetPhoneContacts} = useAsync(getPhoneContactsPromiseFn, {
      defer: true,
    });

    useEffect(() => {
      const customers = getCustomers({realm});
      runGetPhoneContacts().then((contacts) => {
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
    }, [runGetPhoneContacts, realm]);

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
        onPress,
      }: Pick<ListRenderItemInfo<CustomerListItem | null>, 'item'> & {
        onPress?: () => void;
      }) => {
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
                ? () => {
                    onPress?.();
                    getAnalyticsService().logEvent('selectContent', {
                      item_id: String(customer._id),
                      content_type: 'Customer',
                    });
                    handleSelectCustomer(customer);
                  }
                : undefined
            }>
            <View
              style={applyStyles(
                'flex-row items-center border-b-1 border-gray-20 p-16',
              )}>
              <PlaceholderImage text={customer?.name ?? ''} />
              <View style={applyStyles('flex-1 pl-sm')}>
                <Text
                  style={applyStyles(
                    'text-sm text-700 text-gray-300 text-uppercase',
                  )}>
                  {customer.name}
                </Text>
                <Text style={applyStyles('text-sm text-400 text-gray-300')}>
                  {customer.mobile}
                </Text>
              </View>
              {'_id' in customer ? (
                !!customer.remainingCreditAmount && (
                  <View style={applyStyles('items-end')}>
                    <Text
                      style={applyStyles(
                        'text-sm text-700',
                        customer.overdueCreditAmount
                          ? 'text-primary'
                          : 'text-gray-300',
                      )}>
                      {amountWithCurrency(
                        customer.overdueCreditAmount ||
                          customer.remainingCreditAmount,
                      )}
                    </Text>
                    <Text
                      style={applyStyles(
                        'text-xxs text-700 text-red-100 text-uppercase',
                      )}>
                      {customer.overdueCreditAmount ? 'Due' : 'Owes you'}
                    </Text>
                  </View>
                )
              ) : (
                <Touchable
                  onPress={() => {
                    closeModal();
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
      [closeModal, handleCreateCustomer, handleSelectCustomer],
    );

    useLayoutEffect(() => {
      navigation.setOptions({
        headerLeft: (props: StackHeaderLeftButtonProps) => {
          return (
            <HeaderBackButton
              {...props}
              backImage={() => {
                return (
                  <View style={applyStyles('flex-row center')}>
                    <Icon
                      type="feathericons"
                      color={colors['gray-300']}
                      name="users"
                      size={28}
                      borderRadius={12}
                    />
                    <Text
                      style={applyStyles(
                        'pl-sm text-md text-gray-300 text-uppercase',
                        {
                          fontFamily: 'Rubik-Medium',
                        },
                      )}
                      numberOfLines={1}>
                      Customers
                    </Text>
                  </View>
                );
              }}
            />
          );
        },
        headerTitle: () => null,
        headerRight: () => (
          <HeaderRight
            options={[
              {
                icon: 'search',
                onPress: () => {
                  const closeSearchModal = openModal('search', {
                    items: [
                      ...((myCustomers as unknown) as CustomerListItem[]),
                      ...phoneContacts,
                    ],
                    renderItem: ({item, onPress}) => {
                      return renderCustomerListItem({
                        item: item as CustomerListItem,
                        onPress: () => {
                          onPress('');
                          closeSearchModal();
                        },
                      });
                    },
                    setFilter: (item: ICustomer, query) => {
                      // TODO: Improve search algorithm
                      return (
                        (prepareValueForSearch(item.name).search(query) ??
                          -1) !== -1 ||
                        (prepareValueForSearch(item.mobile).search(query) ??
                          -1) !== -1 ||
                        (prepareValueForSearch(
                          item.remainingCreditAmount,
                        ).search(query) ?? -1) !== -1
                      );
                    },
                    textInputProps: {
                      placeholder: 'Search Customers',
                      autoFocus: true,
                    },
                  });
                },
              },
            ]}
            menuOptions={[]}
          />
        ),
      });
    }, [
      myCustomers,
      navigation,
      openModal,
      phoneContacts,
      renderCustomerListItem,
    ]);

    const keyExtractor = useCallback((item) => {
      if (!item) {
        return '';
      }
      return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
    }, []);

    type Filter = 'all' | 'paid' | 'owes';

    const [filter, setFilter] = useState<Filter>('all');

    const handleStatusFilter = useCallback((status: Filter) => {
      setFilter(status);
    }, []);

    const filterOptions = useMemo<Record<Filter, HeaderRightMenuOption>>(
      () => ({
        all: {text: 'All', onSelect: () => handleStatusFilter('all')},
        paid: {text: 'Paid', onSelect: () => handleStatusFilter('paid')},
        owes: {
          text: 'Owes you',
          onSelect: () => handleStatusFilter('owes'),
        },
      }),
      [handleStatusFilter],
    );

    const filterOptionList = useMemo(() => Object.values(filterOptions), [
      filterOptions,
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const handleCustomerSearch = useCallback((query) => {
      setSearchTerm(query);
    }, []);
    console.log(searchTerm, filter);
    return (
      <KeyboardAvoidingView
        style={applyStyles('flex-1', {
          backgroundColor: colors.white,
        })}>
        <HomeContainer<ICustomer>
          initialNumToRender={10}
          headerTitle="total credit"
          createEntityButtonIcon="users"
          renderListItem={renderCustomerListItem}
          data={
            (orderBy(
              myCustomers,
              ['debtLevel', 'name'] as (keyof ICustomer)[],
              ['desc', 'asc'],
            ) as unknown) as ICustomer[]
          }
          searchPlaceholderText="Search Customers"
          createEntityButtonText="Add Customer"
          onCreateEntity={() => navigation.navigate('AddCustomer')}
          headerAmount={amountWithCurrency(financeSummary.totalCredit)}
          keyExtractor={keyExtractor}
          emptyStateProps={{
            heading: 'Add your customers',
            text:
              'Keep track of who your customers are, what they bought, and what they owe you.',
          }}
          filterOptions={filterOptionList}
          activeFilter={filterOptions[filter].text}
          onSearch={handleCustomerSearch}
        />
      </KeyboardAvoidingView>
    );
  },
);

export * from './AddCustomer';
