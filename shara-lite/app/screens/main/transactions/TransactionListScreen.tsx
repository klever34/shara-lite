import {Button, SearchFilter, Text} from '@/components';
import EmptyState from '@/components/EmptyState';
import {EntryButton} from '@/components/EntryView';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {TransactionFilterModal} from '@/components/TransactionFilterModal';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IActivity} from '@/models/Activity';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService, getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import {omit, orderBy} from 'lodash';
import * as Animatable from 'react-native-animatable';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {ActivityListItem} from './ActivityListItem';
import {useTransactionList} from './hook';
import {TransactionListItem} from './TransactionListItem';
// TODO: Translate

const strings = getI18nService().strings;

type Props = ModalWrapperFields;

type IActivityData = IReceipt & IActivity;
type ActivityData = IActivityData & {date?: Date; is_reminder: boolean};

export const TransactionListScreen = withModal(({openModal}: Props) => {
  const navigation = useAppNavigation();
  const {
    filter,
    reloadData,
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
    receiptsToDisplay,
    remindersToDisplay,
    handlePagination,
  } = useTransactionList();

  const activitiesData: any = useMemo(() => {
    const data = [...receiptsToDisplay, ...remindersToDisplay].map((item) => {
      const t = omit(item) as IActivity;
      return {
        ...t,
        is_reminder: !!t.type,
      };
    });
    return orderBy(data, 'created_at', 'desc');
  }, [receiptsToDisplay, remindersToDisplay]);

  useEffect(() => {
    return navigation.addListener('focus', () => {
      reloadData();
    });
  }, [navigation, reloadData]);

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

  const handleReminderItemSelect = useCallback(
    (reminder: IActivity) => {
      const {message, note} = reminder;
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16 px-32')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['green-100']}
              style={applyStyles('mb-40')}
            />
            <View style={applyStyles('mb-40 center', {width: 250})}>
              <Text style={applyStyles('text-700 text-center')}>{message}</Text>
              {!!note && (
                <Text style={applyStyles('text-gray-100 pt-4')}>{note}</Text>
              )}
            </View>
            <Button
              onPress={closeModal}
              title={strings('dismiss')}
              variantColor="transparent"
              style={applyStyles({width: 140})}
            />
          </View>
        ),
      });
    },
    [openModal],
  );

  const renderActivityItem = useCallback(
    ({item: activity}: {item: ActivityData}) => {
      const {is_reminder, type, data, message, ...transaction} = activity;
      const reminder = {
        type,
        data,
        message,
        note: activity.note,
        created_at: activity.created_at,
      };

      return !is_reminder ? (
        <TransactionListItem
          receipt={transaction}
          onPress={() => handleReceiptItemSelect(transaction)}
        />
      ) : (
        <ActivityListItem
          reminder={reminder}
          onPress={() => handleReminderItemSelect(reminder)}
        />
      );
    },
    [handleReceiptItemSelect, handleReminderItemSelect],
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
          containerStyle={applyStyles('flex-1')}
          onClearInput={() => handleReceiptSearch('')}
          placeholderText={strings('search_input_placeholder')}
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
      {!!activitiesData && !!activitiesData.length && (
        <View
          style={applyStyles(
            'px-16 py-12 flex-row bg-gray-10 justify-between items-center',
          )}>
          <Text style={applyStyles('text-base text-gray-300')}>
            {searchTerm
              ? strings('result', {
                  count: activitiesData.length,
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
        data={activitiesData}
        initialNumToRender={10}
        style={applyStyles('bg-white')}
        renderItem={renderActivityItem}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          handlePagination();
        }}
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        contentContainerStyle={
          !activitiesData.length ? applyStyles('flex-1') : undefined
        }
        ListEmptyComponent={
          <EmptyState
            style={applyStyles('')}
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
              {!!filter && filter !== 'all' && (
                <Text
                  style={applyStyles('text-black text-sm pb-4 text-center')}>
                  {strings('transaction.no_activities_recorded_for_duration')}
                </Text>
              )}
              <Text
                style={applyStyles('text-black text-sm text-center', {
                  width: 180,
                })}>
                {strings('transaction.start_adding_records')}
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
        }
      />
      {!!activitiesData.length && (
        <EntryButton
          style={applyStyles('absolute w-72 h-72 rounded-60', {
            bottom: 0,
            right: 16,
            elevation: 4,
          })}
        />
      )}
    </SafeAreaView>
  );
});
