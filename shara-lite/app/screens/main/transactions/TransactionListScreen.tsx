import {SearchFilter} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {TransactionFilterModal} from '@/components/TransactionFilterModal';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors, dimensions} from '@/styles';
import {format} from 'date-fns';
import {Text} from '@/components';
import React, {useCallback, useLayoutEffect} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useTransactionList} from './hook';
import {TransactionListItem} from './TransactionListItem';
import {getI18nService} from '@/services';
// TODO: Translate

const strings = getI18nService().strings;

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
  } = useTransactionList();

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
      requestAnimationFrame(() =>
        navigation.navigate('LedgerEntry', {
          transaction,
          showCustomer: true,
        }),
      );
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

  const handleGoToReportScreen = useCallback(() => {
    getAnalyticsService()
      .logEvent('userViewedReport', {})
      .then(() => {})
      .catch(handleError);
    navigation.navigate('Report');
  }, [navigation]);

  const getFilterLabelText = useCallback(() => {
    const activeOption = filterOptions?.find((item) => item.value === filter);
    if (filter === 'date-range' && filterStartDate && filterEndDate) {
      return `${strings('from')} ${format(
        filterStartDate,
        'dd MMM, yyyy',
      )} ${strings('to')} ${format(filterEndDate, 'dd MMM, yyyy')}`;
    }
    if (filter === 'single-day') {
      return format(filterStartDate, 'dd MMM, yyyy');
    }
    return activeOption?.text;
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
          placeholderText="Search customers here"
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
                {strings('filter', {count: 2})}
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
              {strings('filter', {count: 1})}:{' '}
            </Text>
            <View style={applyStyles('flex-1')}>
              <Text style={applyStyles('text-green-100 text-400')}>
                {getFilterLabelText()}
              </Text>
            </View>
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
      {!searchTerm && (
        <>
          <View
            style={applyStyles(
              'flex-row items-center bg-white justify-between',
              {
                borderBottomWidth: 1,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <View
              style={applyStyles('py-16 flex-row center', {
                width: '48%',
                borderRightWidth: 1,
                borderRightColor: colors['gray-20'],
              })}>
              <View
                style={applyStyles(
                  'w-24 h-24 mr-8 rounded-32 center bg-green-200',
                )}>
                <Icon
                  size={18}
                  name="arrow-down"
                  type="feathericons"
                  color={colors.white}
                />
              </View>
              <View>
                <Text
                  style={applyStyles(
                    'pb-4 text-xs text-uppercase text-400 text-gray-200',
                  )}>
                  {strings('transaction.amount_collected')}
                </Text>
                <Text style={applyStyles('text-700 text-black text-lg')}>
                  {amountWithCurrency(collectedAmount)}
                </Text>
              </View>
            </View>
            <View style={applyStyles('py-16 flex-row center', {width: '48%'})}>
              <View
                style={applyStyles(
                  'w-24 h-24 mr-8 rounded-32 center bg-red-100',
                )}>
                <Icon
                  size={18}
                  name="arrow-up"
                  type="feathericons"
                  color={colors.white}
                />
              </View>
              <View>
                <Text
                  style={applyStyles(
                    'pb-4 text-xs text-uppercase text-400 text-gray-200',
                  )}>
                  {strings('transaction.amount_outstanding')}
                </Text>
                <Text style={applyStyles('text-700 text-black text-lg')}>
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
              style={applyStyles(
                'text-black text-700 text-uppercase flex-1 text-sm',
              )}>
              {strings('transaction.total_amount')}:{' '}
              {amountWithCurrency(totalAmount)}
            </Text>
            <Touchable onPress={handleGoToReportScreen}>
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
                  {strings('transaction.view_report')}
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
      {!!filteredReceipts && !!filteredReceipts.length && (
        <View
          style={applyStyles(
            'px-16 py-12 flex-row bg-gray-10 justify-between items-center',
          )}>
          <Text style={applyStyles('text-base text-gray-300')}>
            {searchTerm
              ? strings('result', {
                  count: filteredReceipts.length,
                })
              : strings('activities')}
          </Text>
          <Touchable onPress={handleOpenFilterModal}>
            <View style={applyStyles('py-4 px-8 flex-row items-center')}>
              <Text
                style={applyStyles(
                  'text-base text-gray-300 text-700 text-uppercase pr-8',
                )}>
                {getFilterLabelText()}
              </Text>
              <Icon
                size={16}
                type="feathericons"
                name="chevron-down"
                color={colors['gray-50']}
              />
            </View>
          </Touchable>
        </View>
      )}
      <FlatList
        data={filteredReceipts}
        initialNumToRender={10}
        style={applyStyles('bg-white')}
        renderItem={renderTransactionItem}
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        ListEmptyComponent={
          <EmptyState
            style={applyStyles('bg-white pt-20')}
            source={require('@/assets/images/emblem.png')}
            imageStyle={applyStyles('pb-32', {width: 60, height: 60})}>
            <View style={applyStyles('center px-8')}>
              {!!searchTerm && (
                <Text
                  style={applyStyles('text-black text-sm pb-4 text-center')}>
                  {strings('result', {
                    count: 0,
                  })}
                </Text>
              )}
              {!!filter && (
                <Text
                  style={applyStyles('text-black text-sm pb-4 text-center')}>
                  {strings('transaction.no_activities_recorded_for_duration')}
                </Text>
              )}
              <Text style={applyStyles('text-black text-sm text-center')}>
                {strings('transaction.start_adding_records')}
              </Text>
            </View>
            <View
              style={applyStyles('center p-16 bottom', {
                height: dimensions.fullHeight - 300,
              })}>
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
                  size={80}
                  name="arrow-down"
                  type="feathericons"
                  color={colors.secondary}
                />
              </Animatable.View>
            </View>
          </EmptyState>
        }
      />
    </SafeAreaView>
  );
});
