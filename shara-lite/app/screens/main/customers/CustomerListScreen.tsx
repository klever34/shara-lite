import {SearchFilter, Text} from '@/components';
import {CustomerListItem} from '@/components/CustomerListItem';
import EmptyState from '@/components/EmptyState';
import {EntryButton} from '@/components/EntryView';
import Icon from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {TransactionFilterModal} from '@/components/TransactionFilterModal';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {ICustomer} from '@/models';
import {getAnalyticsService, getI18nService} from '@/services';
import {useCustomer} from '@/services/customer/hook';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {FlatList, ListRenderItemInfo, SafeAreaView, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useCustomerList} from './hook';

const strings = getI18nService().strings;

type CustomerListItem = ICustomer;

export const CustomerListScreen = withModal(
  ({openModal}: ModalWrapperFields) => {
    const {getCustomers} = useCustomer();
    const navigation = useAppNavigation();

    const customers = getCustomers();
    const analyticsService = getAnalyticsService();
    const {
      filter,
      reloadData,
      searchTerm,
      filterOptions,
      handlePagination,
      filteredCustomers,
      customersToDisplay,
      handleStatusFilter,
      handleCustomerSearch,
    } = useCustomerList({customers});

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
      }: Pick<ListRenderItemInfo<CustomerListItem>, 'item'>) => {
        return (
          <CustomerListItem
            customer={customer}
            onPress={() => {
              handleSelectCustomer(customer);
            }}
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

    useEffect(() => {
      reloadData();
    }, [reloadData, filteredCustomers.length]);

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
              data={customersToDisplay}
              keyExtractor={keyExtractor}
              onEndReachedThreshold={0.1}
              onEndReached={() => {
                handlePagination();
              }}
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
            <View
              style={applyStyles(
                'flex-row items-center justify-between bg-gray-10 px-16 bottom-0 absolute w-full',
              )}>
              <View style={applyStyles('flex-row items-center')}>
                <Text style={applyStyles('text-center text-700 text-xl pr-12')}>
                  Enter a transaction
                </Text>
                <Animatable.View
                  duration={200}
                  animation={{
                    from: {translateX: -10},
                    to: {translateX: 0},
                  }}
                  direction="alternate"
                  useNativeDriver={true}
                  iterationCount="infinite">
                  <Icon
                    size={40}
                    name="arrow-right"
                    type="feathericons"
                    color={colors.secondary}
                  />
                </Animatable.View>
              </View>
              <EntryButton
                style={applyStyles('w-72 h-72 rounded-60', {
                  elevation: 4,
                })}
              />
            </View>
          </EmptyState>
        )}
      </SafeAreaView>
    );
  },
);
