import {SearchFilter, Text} from '@/components';
import {CustomerListItem} from '@/components/CustomerListItem';
import EmptyState from '@/components/EmptyState';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {
  FilterOption,
  TransactionFilterModal,
} from '@/components/TransactionFilterModal';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {ICustomer} from '@/models';
import {getAnalyticsService, getI18nService} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import orderBy from 'lodash/orderBy';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {FlatList, ListRenderItemInfo, SafeAreaView, View} from 'react-native';

const strings = getI18nService().strings;

type CustomerListItem = ICustomer;

interface UseCustomerListOptions {
  orderByOptions?: {
    orderByQuery: string[];
    orderByOrder:
      | boolean
      | 'asc'
      | 'desc'
      | readonly (boolean | 'asc' | 'desc')[]
      | undefined;
  };
  initialFilter?: string;
  filterOptions?: FilterOption[];
}

export const useCustomerList = (options: UseCustomerListOptions = {}) => {
  let {orderByOptions, filterOptions, initialFilter = 'all'} = options;
  const {orderByOrder = ['desc', 'asc'], orderByQuery = ['debtLevel', 'name']} =
    orderByOptions ?? {};
  const {getCustomers} = useCustomer();
  const navigation = useAppNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [myCustomers, setMyCustomers] = useState(getCustomers());
  const [filter, setFilter] = useState<string | undefined>(initialFilter);

  const handleStatusFilter = useCallback((payload: {status?: string}) => {
    const {status} = payload;
    setFilter(status);
  }, []);

  const reloadMyCustomers = useCallback(() => {
    const nextMyCustomers = getCustomers();
    setMyCustomers(nextMyCustomers);
  }, [getCustomers]);

  const handleCustomerSearch = useCallback((query) => {
    setSearchTerm(query);
  }, []);

  const filteredCustomers = useMemo(() => {
    let customers = (myCustomers as unknown) as Realm.Results<
      ICustomer & Realm.Object
    >;
    if (searchTerm) {
      customers = customers.filtered(
        `name CONTAINS[c] "${searchTerm}" OR mobile CONTAINS[c] "${searchTerm}"`,
      );
    }
    if (filter) {
      switch (filter) {
        case 'all':
          customers = customers;
          break;
        case 'owing':
          customers = (customers.filter(
            (item) => item?.balance && item?.balance < 0,
          ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
          break;
        case 'not-owing':
          customers = (customers.filter(
            (item) => item?.balance !== undefined && item?.balance >= 0,
          ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
          break;
        case 'surplus':
          customers = (customers.filter(
            (item) => item?.balance && item?.balance > 0,
          ) as unknown) as Realm.Results<ICustomer & Realm.Object>;
          break;
        default:
          customers = customers;
          break;
      }
    }
    return orderBy(
      customers,
      orderByQuery as (keyof ICustomer)[],
      orderByOrder,
    );
  }, [filter, myCustomers, searchTerm, orderByQuery, orderByOrder]);

  filterOptions =
    filterOptions ??
    useMemo(
      () => [
        {text: 'All', value: 'all'},
        {
          text: strings('filter_options.owing'),
          value: 'owing',
        },
        {
          text: strings('filter_options.not_owing'),
          value: 'not-owing',
        },
        {
          text: strings('filter_options.surplus'),
          value: 'surplus',
        },
      ],
      [],
    );

  useEffect(() => {
    return navigation.addListener('focus', reloadMyCustomers);
  }, [navigation, reloadMyCustomers]);

  return useMemo(
    () => ({
      filter,
      searchTerm,
      filterOptions,
      filteredCustomers,
      handleStatusFilter,
      handleCustomerSearch,
    }),
    [
      filter,
      searchTerm,
      filterOptions,
      filteredCustomers,
      handleStatusFilter,
      handleCustomerSearch,
    ],
  );
};

export const CustomerListScreen = withModal(
  ({openModal}: ModalWrapperFields) => {
    const navigation = useAppNavigation();
    const analyticsService = getAnalyticsService();

    const {
      filter,
      searchTerm,
      filterOptions,
      filteredCustomers,
      handleStatusFilter,
      handleCustomerSearch,
    } = useCustomerList();

    const handleSelectCustomer = useCallback(
      (item?: ICustomer) => {
        analyticsService
          .logEvent('selectContent', {
            item_id: item?._id?.toString() ?? '',
            content_type: 'customer',
          })
          .then(() => {});
        requestAnimationFrame(() =>
          navigation.navigate('CustomerDetails', {customer: item}),
        );
      },
      [navigation, analyticsService],
    );

    const renderCustomerListItem = useCallback(
      ({
        item: customer,
        onPress,
      }: Pick<ListRenderItemInfo<CustomerListItem>, 'item'> & {
        onPress?: () => void;
      }) => {
        return (
          <CustomerListItem
            customer={customer}
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
            }
            containerStyle={applyStyles('p-16')}
          />
        );
      },
      [handleSelectCustomer],
    );

    const keyExtractor = useCallback((item) => {
      if (!item) {
        return '';
      }
      return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
    }, []);

    const getFilterLabelText = useCallback(() => {
      const activeOption = filterOptions?.find((item) => item.value === filter);
      return (
        <Text style={applyStyles('text-green-100 text-400 text-capitalize')}>
          {activeOption?.text}
        </Text>
      );
    }, [filter, filterOptions]);

    const handleClear = useCallback(() => {
      handleStatusFilter({
        status: 'all',
      });
    }, [handleStatusFilter]);

    const handleOpenFilterModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <TransactionFilterModal
            onClose={closeModal}
            initialFilter={filter}
            options={filterOptions}
            onDone={handleStatusFilter}
          />
        ),
      });
    }, [filter, filterOptions, openModal, handleStatusFilter]);

    useLayoutEffect(() => {
      navigation.setOptions({
        header: () => null,
      });
    }, [navigation]);

    return (
      <SafeAreaView style={applyStyles('flex-1 bg-white')}>
        <View
          style={applyStyles('pr-8 flex-row items-center justify-between', {
            borderBottomWidth: 1.5,
            borderBottomColor: colors['gray-20'],
          })}>
          <SearchFilter
            value={searchTerm}
            onSearch={handleCustomerSearch}
            containerStyle={applyStyles('flex-1')}
            placeholderText={strings('search_input_placeholder')}
            onClearInput={() => handleCustomerSearch('')}
          />
          {!searchTerm && (
            <Touchable onPress={handleOpenFilterModal}>
              <View style={applyStyles('py-4 px-8 flex-row items-center')}>
                <Text style={applyStyles('text-gray-200 text-700 pr-8')}>
                  {strings('filter', {count: 2})}
                </Text>
                <Icon
                  size={16}
                  name="chevron-down"
                  type="feathericons"
                  color={colors['gray-50']}
                />
              </View>
            </Touchable>
          )}
        </View>

        {!!filteredCustomers && filteredCustomers.length ? (
          <>
            {filter && filter !== 'all' && (
              <View
                style={applyStyles(
                  'py-8 px-16 flex-row items-center justify-between',
                  {
                    borderBottomWidth: 1.5,
                    borderBottomColor: colors['gray-20'],
                  },
                )}>
                <View style={applyStyles('flex-row items-center flex-1')}>
                  <Text
                    style={applyStyles('text-gray-50 text-700 text-uppercase')}>
                    {strings('filter', {count: 1})}:{' '}
                  </Text>
                  <View style={applyStyles('flex-1')}>
                    {getFilterLabelText()}
                  </View>
                </View>
                <Touchable onPress={handleClear}>
                  <View
                    style={applyStyles(
                      'py-4 px-8 flex-row items-center bg-gray-20',
                      {
                        borderWidth: 1,
                        borderRadius: 24,
                        borderColor: colors['gray-20'],
                      },
                    )}>
                    <Text
                      style={applyStyles(
                        'text-xs text-gray-200 text-700 text-uppercase pr-8',
                      )}>
                      {strings('clear')}
                    </Text>
                    <Icon
                      name="x"
                      size={16}
                      type="feathericons"
                      color={colors['gray-50']}
                    />
                  </View>
                </Touchable>
              </View>
            )}
            <View style={applyStyles('px-16 py-12 flex-row bg-gray-10')}>
              <Text style={applyStyles('text-base text-gray-300')}>
                {strings('customers.customer_count', {
                  count: filteredCustomers.length,
                })}
              </Text>
            </View>
            <FlatList
              initialNumToRender={10}
              data={filteredCustomers}
              keyExtractor={keyExtractor}
              style={applyStyles('bg-white')}
              renderItem={renderCustomerListItem}
              getItemLayout={(_, index) => ({
                length: 73.1,
                offset: 73.1 * index,
                index,
              })}
            />
          </>
        ) : (
          <EmptyState
            style={applyStyles('bg-white')}
            source={require('@/assets/images/emblem.png')}
            imageStyle={applyStyles('pb-32', {width: 60, height: 60})}>
            <View style={applyStyles('center')}>
              <Text style={applyStyles('text-black text-sm pb-4 text-center')}>
                {searchTerm
                  ? strings('no_result_found')
                  : strings('customers.customer_count', {count: 0})}
              </Text>
              <Text
                style={applyStyles('text-black text-sm text-center', {
                  width: 200,
                })}>
                {strings('customers.start_adding')}
              </Text>
            </View>
          </EmptyState>
        )}
      </SafeAreaView>
    );
  },
);
