import Emblem from '@/assets/images/emblem-gray.svg';
import {Button, SearchFilter, Text} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {TransactionFilterModal} from '@/components/TransactionFilterModal';
import {withModal} from '@/helpers/hocs';
import {useClipboard} from '@/helpers/hooks';
import {amountWithCurrency} from '@/helpers/utils';
import {ICollection} from '@/models/Collection';
import {IDisbursement} from '@/models/Disbursement';
import {MoneyDepositScreen} from '@/screens/main/money/MoneyDepositScreen';
import MoneyWithdrawModal from '@/screens/main/money/MoneyWithdrawModal';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles, as, colors} from '@/styles';
import {format} from 'date-fns';
import {orderBy} from 'lodash';
import React, {useCallback, useEffect, useMemo} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {usePaymentActivities} from './hook';
import {MoneyActionsContainer} from './MoneyActionsContainer';
import {PaymentActivityItem} from './PaymentActivityItem';
import {useDisbursementMethod} from '@/services/disbursement-method';

const strings = getI18nService().strings;

export const PaymentActivitiesScreen = withModal(({openModal, closeModal}) => {
  const navigation = useAppNavigation();
  const {copyToClipboard} = useClipboard();
  const {
    filter,
    searchTerm,
    merchantId,
    reloadData,
    collections,
    handleFilter,
    handleSearch,
    filterOptions,
    walletBalance,
    filterEndDate,
    disbursements,
    filterStartDate,
    handlePagination,
    totalReceivedAmount,
    filteredCollections,
    totalWithdrawnAmount,
    filteredDisbursements,
  } = usePaymentActivities();

  const activitiesData: (ICollection | IDisbursement)[] = useMemo(() => {
    const data = [...collections, ...disbursements];
    return orderBy(data, 'created_at', 'desc');
  }, [collections, disbursements]);

  useEffect(() => {
    if (!searchTerm) {
      reloadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reloadData,
    searchTerm,
    filteredCollections.length,
    filteredDisbursements.length,
  ]);

  const handleCopyMerchantId = useCallback(() => {
    copyToClipboard(String(merchantId));
  }, [copyToClipboard, merchantId]);

  const handleDeposit = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => <MoneyDepositScreen onClose={closeModal} />,
    });
  }, [closeModal, openModal]);

  const handleWithdraw = useCallback(() => {
    openModal('bottom-half', {
      renderContent: () => <MoneyWithdrawModal onClose={closeModal} />,
    });
  }, [closeModal, openModal]);

  const handleOpenFilterModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <TransactionFilterModal
          onClose={closeModal}
          onDone={handleFilter}
          initialFilter={filter}
          options={filterOptions}
        />
      ),
    });
  }, [filter, filterOptions, openModal, handleFilter]);

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

  // TODO: Add logic to check whether money settings is set up
  const {getDisbursementMethods} = useDisbursementMethod();
  const disbursementMethods = getDisbursementMethods();
  const isPaymentSettingsSetup = !!disbursementMethods.length;

  const onGoToMoneySettings = useCallback(() => {
    navigation.navigate('PaymentSettings');
  }, [navigation]);

  const handleDrawdown = useCallback(() => {
    navigation.navigate('Drawdown');
  }, [navigation]);

  const renderListItem = useCallback(
    ({item: data}) => <PaymentActivityItem data={data} />,
    [],
  );

  if (!isPaymentSettingsSetup) {
    return (
      <SafeAreaView style={applyStyles('flex-1 bg-white')}>
        <View style={as('flex-1 center px-32')}>
          <Emblem width={64} height={64} />
          <Text style={as('text-center mt-24 mb-32 text-gray-200')}>
            {strings('payment_activities.empty_state.description')}
          </Text>
          <Button
            title={strings('payment_activities.empty_state.tag')}
            style={as('w-full')}
            onPress={onGoToMoneySettings}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-white')}>
      <View
        style={applyStyles('pr-8 flex-row items-center justify-between', {
          borderBottomWidth: 1.5,
          borderBottomColor: colors['gray-20'],
        })}>
        <SearchFilter
          value={searchTerm}
          onSearch={handleSearch}
          containerStyle={applyStyles('flex-1')}
          onClearInput={() => handleSearch('')}
          placeholderText={strings('payment_activities.search_placeholder')}
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
      <View
        style={as(
          'flex-row justify-between py-12 border-b-1 border-b-gray-20 px-12',
          {borderBottomWidth: 1.5},
        )}>
        <View style={as('flex-row items-center')}>
          <Icon
            type="feathericons"
            name="arrow-down"
            color={colors['green-200']}
            style={as('mr-4')}
            size={16}
          />
          <Text style={as('')}>
            {strings('payment_activities.received')}:{' '}
            <Text style={as('font-bold')}>
              {amountWithCurrency(totalReceivedAmount)}
            </Text>
          </Text>
        </View>
        <View style={as('flex-row items-center')}>
          <Icon
            type="feathericons"
            name="arrow-up"
            color={colors['red-100']}
            style={as('mr-4')}
            size={16}
          />
          <Text style={as('')}>
            {strings('payment_activities.withdrawn')}:{' '}
            <Text style={as('font-bold')}>
              {amountWithCurrency(totalWithdrawnAmount)}
            </Text>
          </Text>
        </View>
        <View />
      </View>
      <MoneyActionsContainer
        figure={{
          label: strings('payment_activities.your_wallet_balance'),
          value: amountWithCurrency(walletBalance),
        }}
        tag={
          !merchantId
            ? undefined
            : {
                label: strings('payment_activities.merchant_id', {
                  merchant_id: merchantId,
                }),
                onPress: handleCopyMerchantId,
                pressInfo: strings('payment_activities.tap_to_copy'),
              }
        }
        actions={[
          {
            icon: {
              name: 'plus',
              color: colors['green-200'],
              bgColor: colors['green-50'],
            },
            onPress: handleDeposit,
            label: strings('payment_activities.deposit'),
          },
          {
            icon: {
              name: 'arrow-up',
              color: colors['red-100'],
              bgColor: colors['red-10'],
            },
            onPress: handleWithdraw,
            label: strings('payment_activities.withdraw'),
          },
          {
            icon: {
              name: 'dollar-sign',
              color: colors['blue-100'],
              bgColor: colors['blue-10'],
            },
            onPress: handleDrawdown,
            label: strings('payment_activities.drawdown'),
          },
        ]}
      />
      <View
        style={applyStyles(
          'px-16 py-12 flex-row bg-gray-10 justify-between items-center',
        )}>
        <Text style={applyStyles('text-base text-gray-300')}>
          {strings('payment_activities.payment_activities')}
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
      <FlatList
        data={activitiesData}
        initialNumToRender={10}
        renderItem={renderListItem}
        onEndReachedThreshold={0.2}
        style={applyStyles('bg-white flex-1', {paddingBottom: 50})}
        keyExtractor={(item) => `${item?._id?.toString()}`}
        contentContainerStyle={
          !activitiesData.length ? as('flex-1') : undefined
        }
        onEndReached={() => {
          handlePagination();
        }}
        ListEmptyComponent={
          <EmptyState>
            <View style={applyStyles('center px-8')}>
              <Text style={applyStyles('text-gray-50 text-sm text-center')}>
                {strings('payment_activities.no_money_activities')}
              </Text>
            </View>
          </EmptyState>
        }
      />
    </SafeAreaView>
  );
});
