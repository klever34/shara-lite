import {SearchFilter} from '@/components';
import EmptyState from '@/components/EmptyState';
import Icon from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getAnalyticsService} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {formatDistanceToNowStrict} from 'date-fns';
import orderBy from 'lodash/orderBy';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

type CustomerListItem = ICustomer;

interface UseCustomerListOptions {
  orderByQuery: string[];
  orderByOrder:
    | boolean
    | 'asc'
    | 'desc'
    | readonly (boolean | 'asc' | 'desc')[]
    | undefined;
}

export const useCustomerList = (options = {}) => {
  const {
    orderByQuery = ['debtLevel', 'name'],
    orderByOrder = ['desc', 'asc'],
  } = options as UseCustomerListOptions;
  const {getCustomers} = useCustomer();
  const navigation = useAppNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [myCustomers, setMyCustomers] = useState(getCustomers());

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
    return orderBy(
      customers,
      orderByQuery as (keyof ICustomer)[],
      orderByOrder,
    );
  }, [myCustomers, searchTerm, orderByQuery, orderByOrder]);

  useEffect(() => {
    return navigation.addListener('focus', reloadMyCustomers);
  }, [navigation, reloadMyCustomers]);

  return useMemo(
    () => ({
      searchTerm,
      filteredCustomers,
      handleCustomerSearch,
    }),
    [searchTerm, filteredCustomers, handleCustomerSearch],
  );
};

export const CustomerListScreen = () => {
  const navigation = useAppNavigation();
  const analyticsService = getAnalyticsService();

  const {
    searchTerm,
    filteredCustomers,
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
      navigation.navigate('CustomerDetails', {customer: item});
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
      const getDateText = () => {
        if (customer.dueDate) {
          if (customer.overdueCreditAmount) {
            return (
              <Text style={applyStyles('text-xs text-700 text-red-100')}>
                Due{' '}
                {formatDistanceToNowStrict(customer.dueDate, {
                  addSuffix: true,
                })}
              </Text>
            );
          }
          if (customer.remainingCreditAmount && !customer.overdueCreditAmount) {
            return (
              <Text style={applyStyles('text-xs text-700 text-red-100')}>
                Collect in{' '}
                {formatDistanceToNowStrict(customer.dueDate, {
                  addSuffix: true,
                })}
              </Text>
            );
          }
        }
        if (!customer.dueDate && customer.remainingCreditAmount) {
          return (
            <Text style={applyStyles('text-xs text-700 text-gray-100')}>
              No Collection Date
            </Text>
          );
        }
        return (
          <Text style={applyStyles('text-xs text-700 text-gray-100')}>
            {customer?.created_at &&
              formatDistanceToNowStrict(customer?.created_at, {
                addSuffix: true,
              })}
          </Text>
        );
      };

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
                style={applyStyles('pb-4 text-base text-400 text-gray-300')}>
                {customer.name}
              </Text>
              {getDateText()}
            </View>
            <View style={applyStyles('items-end flex-row')}>
              <Text style={applyStyles('text-base text-700 text-black')}>
                {amountWithCurrency(customer.remainingCreditAmount ?? 0)}
              </Text>
              {!!customer.remainingCreditAmount && (
                <View style={applyStyles('pl-4')}>
                  <Icon
                    size={18}
                    name="arrow-up"
                    type="feathericons"
                    color={colors['red-100']}
                  />
                </View>
              )}
            </View>
          </View>
        </Touchable>
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

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => null,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={applyStyles('flex-1')}>
      <View
        style={applyStyles({
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <SearchFilter
          value={searchTerm}
          onSearch={handleCustomerSearch}
          placeholderText="Search customers here"
          onClearInput={() => handleCustomerSearch('')}
        />
      </View>

      {!!filteredCustomers && filteredCustomers.length ? (
        <>
          <View style={applyStyles('px-16 py-12 flex-row bg-gray-10')}>
            <Text style={applyStyles('text-base text-gray-300')}>
              {filteredCustomers.length} Customers
            </Text>
          </View>
          <FlatList
            initialNumToRender={10}
            data={filteredCustomers}
            keyExtractor={keyExtractor}
            style={applyStyles('bg-white')}
            renderItem={renderCustomerListItem}
          />
        </>
      ) : (
        <EmptyState
          style={applyStyles('bg-white')}
          source={require('@/assets/images/emblem.png')}
          imageStyle={applyStyles('pb-32', {width: 80, height: 80})}>
          <View style={applyStyles('center')}>
            <Text style={applyStyles('text-black text-xl pb-4 text-center')}>
              {searchTerm ? 'No results found' : 'You have no customers yet.'}
            </Text>
            <Text style={applyStyles('text-black text-xl text-center')}>
              {searchTerm
                ? 'Start adding records by tapping here'
                : 'Start adding customers by creating a record here'}
            </Text>
          </View>
          <View style={applyStyles('center p-16 w-full')}>
            <Animatable.View
              duration={200}
              animation={{
                from: {translateY: -10},
                to: {translateY: 0},
              }}
              direction="alternate"
              useNativeDriver={true}
              iterationCount="infinite">
              <Icon
                size={200}
                name="arrow-down"
                type="feathericons"
                color={colors.primary}
              />
            </Animatable.View>
          </View>
        </EmptyState>
      )}
    </SafeAreaView>
  );
};
