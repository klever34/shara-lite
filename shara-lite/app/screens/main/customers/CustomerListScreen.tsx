import {HomeContainer} from '@/components';
import EmptyState from '@/components/EmptyState';
import Icon from '@/components/Icon';
import PlaceholderImage from '@/components/PlaceholderImage';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getAnalyticsService} from '@/services';
import {getCustomers} from '@/services/customer/service';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import {format, formatDistanceToNowStrict} from 'date-fns';
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
  View,
} from 'react-native';

type CustomerListItem = ICustomer;

export const CustomerListScreen = () => {
  const realm = useRealm();
  const navigation = useAppNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [myCustomers, setMyCustomers] = useState(getCustomers({realm}));

  const analyticsService = getAnalyticsService();

  const reloadMyCustomers = useCallback(() => {
    if (realm) {
      const nextMyCustomers = getCustomers({realm});
      setMyCustomers(nextMyCustomers);
    }
  }, [realm]);

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
    }: Pick<ListRenderItemInfo<CustomerListItem | null>, 'item'> & {
      onPress?: () => void;
    }) => {
      const credit =
        customer?.credits && customer.credits[customer?.credits.length - 1];
      if (!customer) {
        return (
          <EmptyState
            heading="You don't have any customers on Shara yet"
            text="Add a new customer from the list below"
            source={require('../../../assets/images/coming-soon.png')}
          />
        );
      }

      const getDateText = () => {
        if (customer?.dueDate) {
          if (customer.overdueCreditAmount) {
            return (
              <Text
                style={applyStyles(
                  'text-xxs text-700 text-red-200 text-uppercase',
                )}>
                Due{' '}
                {formatDistanceToNowStrict(customer.dueDate, {
                  addSuffix: true,
                })}
              </Text>
            );
          } else {
            return (
              <Text
                style={applyStyles(
                  'text-xxs text-700 text-gray-200 text-uppercase',
                )}>
                collect on {format(customer.dueDate, 'dd MMM yyyy')}
              </Text>
            );
          }
        } else {
          return (
            <Text
              style={applyStyles(
                'text-xxs text-700 text-gray-50 text-uppercase',
              )}>
              set collection date
            </Text>
          );
        }
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
                style={applyStyles(
                  'text-sm text-700 text-gray-300 text-uppercase',
                )}>
                {customer.name}
              </Text>
              <Text style={applyStyles('text-sm text-400 text-gray-300')}>
                {credit
                  ? credit?.created_at &&
                    formatDistanceToNowStrict(credit.created_at, {
                      addSuffix: true,
                    })
                  : customer?.mobile}
              </Text>
            </View>
            {!!customer.remainingCreditAmount && (
              <View style={applyStyles('items-end')}>
                <Text style={applyStyles('text-sm text-700 text-red-200')}>
                  {amountWithCurrency(customer.remainingCreditAmount)}
                </Text>
                {getDateText()}
              </View>
            )}
          </View>
        </Touchable>
      );
    },
    [handleSelectCustomer],
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
                    size={22}
                    name="users"
                    borderRadius={12}
                    type="feathericons"
                    color={colors['gray-300']}
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
    });
  }, [navigation]);

  const keyExtractor = useCallback((item) => {
    if (!item) {
      return '';
    }
    return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
  }, []);

  const handleCustomerSearch = useCallback((query) => {
    setSearchTerm(query);
  }, []);

  const filteredCustomers = useMemo(() => {
    let customers = myCustomers;
    if (searchTerm) {
      customers = customers.filtered(
        `name CONTAINS[c] "${searchTerm}" OR mobile CONTAINS[c] "${searchTerm}"`,
      );
    }
    return orderBy(customers, ['debtLevel', 'name'] as (keyof ICustomer)[], [
      'desc',
      'asc',
    ]);
  }, [myCustomers, searchTerm]);

  useEffect(() => {
    return navigation.addListener('focus', reloadMyCustomers);
  }, [navigation, realm, reloadMyCustomers]);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {
        backgroundColor: colors.white,
      })}>
      <HomeContainer<ICustomer>
        showFAB={false}
        initialNumToRender={10}
        searchTerm={searchTerm}
        data={filteredCustomers}
        keyExtractor={keyExtractor}
        onSearch={handleCustomerSearch}
        renderListItem={renderCustomerListItem}
        onClearInput={() => handleCustomerSearch('')}
        searchPlaceholderText={`Search ${filteredCustomers.length} Customers`}
      />
    </KeyboardAvoidingView>
  );
};
