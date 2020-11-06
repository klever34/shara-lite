import EmptyState from '@/components/EmptyState';
import {HeaderRight, HeaderRightMenuOption} from '@/components/HeaderRight';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {getAnalyticsService} from '@/services';
import {getCustomers} from '@/services/customer/service';
import {useRealm} from '@/services/realm';
import {colors} from '@/styles';
import orderBy from 'lodash/orderBy';
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Text,
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
import {withModal, ModalWrapperFields} from '@/helpers/hocs';
import {selectContactPhone} from 'react-native-select-contact';
import {useAddCustomer} from '@/services/customer/hooks';

type CustomerListItem = ICustomer;

type CustomerListScreenProps = ModalWrapperFields & {};

export const CustomerListScreen = withModal(
  ({openModal}: CustomerListScreenProps) => {
    const navigation = useAppNavigation();
    const realm = useRealm();
    const myCustomers = getCustomers({realm});
    const analyticsService = getAnalyticsService();
    const financeSummary: IFinanceSummary = getSummary({realm});
    const [searchTerm, setSearchTerm] = useState('');
    type Filter = 'all' | 'paid' | 'owes';
    const [filter, setFilter] = useState<Filter>('all');

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
              {!!customer.remainingCreditAmount && (
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
          <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
        ),
      });
    }, [myCustomers, navigation, renderCustomerListItem]);

    const keyExtractor = useCallback((item) => {
      if (!item) {
        return '';
      }
      return `${'_id' in item ? item._id + '-' : ''}${item.mobile}`;
    }, []);

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
    const handleCustomerSearch = useCallback((query) => {
      setSearchTerm(query);
    }, []);

    const filteredCustomers = useMemo(() => {
      let customers = myCustomers;
      if (filter) {
        switch (filter) {
          case 'paid':
            customers = myCustomers.filtered('ALL credits.amount_left = 0');
            break;
          case 'owes':
            customers = myCustomers.filtered('ANY credits.amount_left > 0');
            break;
          case 'all':
          default:
            customers = myCustomers;
            break;
        }
      }
      if (searchTerm) {
        customers = customers.filtered(
          `name CONTAINS[c] "${searchTerm}" OR mobile CONTAINS[c] "${searchTerm}"`,
        );
      }
      return orderBy(customers, ['debtLevel', 'name'] as (keyof ICustomer)[], [
        'desc',
        'asc',
      ]);
    }, [filter, myCustomers, searchTerm]);
    const addCustomer = useAddCustomer();
    const handleAddCustomer = useCallback(() => {
      openModal('options', {
        options: [
          {
            text: 'Create a new customer',
            onPress: () => {
              navigation.navigate('AddCustomer');
            },
          },
          {
            text: 'Add from your phone contacts',
            onPress: () => {
              selectContactPhone().then((selection) => {
                if (!selection) {
                  return;
                }
                let {contact, selectedPhone} = selection;
                addCustomer({
                  name: contact.name,
                  mobile: selectedPhone.number,
                  email: contact.emails[0]?.address,
                });
              });
            },
          },
        ],
      });
    }, [addCustomer, navigation, openModal]);

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
          data={filteredCustomers}
          searchPlaceholderText="Search Customers"
          createEntityButtonText="Add Customer"
          onCreateEntity={handleAddCustomer}
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
