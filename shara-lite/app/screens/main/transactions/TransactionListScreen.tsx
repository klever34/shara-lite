import {SearchFilter} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {TransactionFilterModal} from '@/components/TransactionFilterModal';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback, useLayoutEffect} from 'react';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useReceiptList} from './hook';
import {TransactionListItem} from './TransactionListItem';

type Props = ModalWrapperFields;

export const TransactionListScreen = withModal(({openModal}: Props) => {
  const navigation = useAppNavigation();
  const {
    filter,
    searchTerm,
    totalAmount,
    filterEndDate,
    filterOptions,
    collectedAmount,
    filterStartDate,
    filteredReceipts,
    outstandingAmount,
    handleStatusFilter,
    handleReceiptSearch,
  } = useReceiptList();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => null,
    });
  }, [navigation]);

  const handleReceiptItemSelect = useCallback(
    (transaction: IReceipt) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          content_type: 'transaction',
          item_id: transaction?._id?.toString() ?? '',
        })
        .then(() => {});
      navigation.navigate('LedgerEntry', {
        transaction,
        showCustomer: true,
      });
    },
    [navigation],
  );

  const renderTransactionItem = useCallback(
    ({item: transaction}: {item: IReceipt}) => {
      return (
        <TransactionListItem
          receipt={transaction}
          onPress={() => handleReceiptItemSelect(transaction)}
        />
      );
    },
    [handleReceiptItemSelect],
  );

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

  const handleClear = useCallback(() => {
    handleStatusFilter({
      status: 'all',
    });
  }, [handleStatusFilter]);

  const getFilterLabelText = useCallback(() => {
    const activeOption = filterOptions.find((item) => item.value === filter);
    if (filter === 'date-range' && filterStartDate && filterEndDate) {
      return (
        <Text>
          <Text style={applyStyles('text-gray-300 text-400')}>From</Text>{' '}
          <Text style={applyStyles('text-red-200 text-400')}>
            {format(filterStartDate, 'dd MMM, yyyy')}
          </Text>{' '}
          <Text style={applyStyles('text-gray-300 text-400')}>to</Text>{' '}
          <Text style={applyStyles('text-red-200 text-400')}>
            {format(filterEndDate, 'dd MMM, yyyy')}
          </Text>
        </Text>
      );
    }
    return (
      <Text style={applyStyles('text-red-200 text-400 text-capitalize')}>
        {activeOption?.text}
      </Text>
    );
  }, [filter, filterEndDate, filterOptions, filterStartDate]);

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <View
        style={applyStyles('pr-8 flex-row items-center justify-between', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <SearchFilter
          value={searchTerm}
          onSearch={handleReceiptSearch}
          placeholderText="Search records here"
          containerStyle={applyStyles('flex-1')}
          onClearInput={() => handleReceiptSearch('')}
        />
        {!searchTerm && (
          <Touchable onPress={handleOpenFilterModal}>
            <View
              style={applyStyles('py-4 px-8 flex-row items-center', {
                borderWidth: 1,
                borderRadius: 4,
                borderColor: colors['gray-20'],
              })}>
              <Text style={applyStyles('text-gray-200 text-700 pr-8')}>
                Filters
              </Text>
              <Icon
                size={16}
                name="calendar"
                type="feathericons"
                color={colors['gray-50']}
              />
            </View>
          </Touchable>
        )}
      </View>
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
            <Text style={applyStyles('text-gray-50 text-700 text-uppercase')}>
              Filter:{' '}
            </Text>
            <View style={applyStyles('flex-1')}>{getFilterLabelText()}</View>
          </View>
          <Touchable onPress={handleClear}>
            <View
              style={applyStyles('py-4 px-8 flex-row items-center bg-gray-20', {
                borderWidth: 1,
                borderRadius: 24,
                borderColor: colors['gray-20'],
              })}>
              <Text
                style={applyStyles(
                  'text-xs text-gray-200 text-700 text-uppercase pr-8',
                )}>
                Clear
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
      {!searchTerm && (
        <>
          <View
            style={applyStyles('flex-row items-center bg-white', {
              borderBottomWidth: 1,
              borderBottomColor: colors['gray-20'],
            })}>
            <View
              style={applyStyles('py-16 flex-row center', {
                width: '48%',
                borderRightWidth: 1,
                borderRightColor: colors['gray-20'],
              })}>
              <View
                style={applyStyles(
                  'w-24 h-24 mr-8 rounded-16 center bg-green-200',
                )}>
                <Icon
                  size={24}
                  name="arrow-up"
                  type="feathericons"
                  color={colors.white}
                />
              </View>
              <View>
                <Text
                  style={applyStyles(
                    'pb-4 text-uppercase text-400 text-gray-200',
                  )}>
                  collected
                </Text>
                <Text style={applyStyles('text-700 text-black text-base')}>
                  {amountWithCurrency(collectedAmount)}
                </Text>
              </View>
            </View>
            <View style={applyStyles('py-16 flex-row center', {width: '48%'})}>
              <View
                style={applyStyles(
                  'w-24 h-24 mr-8 rounded-16 center bg-red-100',
                )}>
                <Icon
                  size={24}
                  name="arrow-down"
                  type="feathericons"
                  color={colors.white}
                />
              </View>
              <View>
                <Text
                  style={applyStyles(
                    'pb-4 text-uppercase text-400 text-gray-200',
                  )}>
                  outstanding
                </Text>
                <Text style={applyStyles('text-700 text-black text-base')}>
                  {amountWithCurrency(outstandingAmount)}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={applyStyles(
              'py-8 px-16 flex-row items-center justify-between',
              {
                borderBottomWidth: 1.5,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <Text
              style={applyStyles('text-black text-700 text-uppercase flex-1')}>
              Total: {amountWithCurrency(totalAmount)}
            </Text>
            <Touchable>
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
                    'text-xxs text-gray-200 text-700 text-uppercase pr-8',
                  )}>
                  View report
                </Text>
                <Icon
                  size={16}
                  type="feathericons"
                  name="chevron-right"
                  color={colors['gray-50']}
                />
              </View>
            </Touchable>
          </View>
        </>
      )}
      {!!filteredReceipts && filteredReceipts.length ? (
        <>
          <View style={applyStyles('px-16 py-12 flex-row bg-gray-10')}>
            <Text style={applyStyles('text-base text-gray-300')}>
              {searchTerm
                ? `${filteredReceipts.length} ${
                    filteredReceipts.length > 1 ? 'Results' : 'Result'
                  }`
                : 'Activities'}
            </Text>
          </View>
          <FlatList
            data={filteredReceipts}
            initialNumToRender={10}
            style={applyStyles('bg-white')}
            renderItem={renderTransactionItem}
            keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          />
        </>
      ) : (
        <EmptyState
          style={applyStyles('bg-white')}
          source={require('@/assets/images/emblem.png')}
          imageStyle={applyStyles('pb-32', {width: 80, height: 80})}>
          <View style={applyStyles('center')}>
            <Text style={applyStyles('text-black text-xl pb-4')}>
              {searchTerm || filter
                ? 'No results found'
                : 'You have no records yet.'}
            </Text>
            <Text style={applyStyles('text-black text-xl')}>
              Start adding records by tapping here
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
                size={100}
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
});
