import {
  Button,
  DatePicker,
  FilterButton,
  FilterButtonGroup,
} from '@/components';
import EmptyState from '@/components/EmptyState';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {useRealm} from '@/services/realm';
import {getReceipts} from '@/services/ReceiptService';
import {colors} from '@/styles';
import {format, isEqual, isToday} from 'date-fns';
import {sortBy} from 'lodash';
import React, {useCallback, useState} from 'react';
import {KeyboardAvoidingView, Text, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

const statusFilters = [
  {label: 'All', value: 'all'},
  {label: 'Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  {label: 'Pending', value: 'pending'},
  {label: 'Cancelled', value: 'cancelled'},
];

const renderReceiptItem = ({item}: {item: IReceipt}) => {
  const isPaid = item.total_amount === item.amount_paid;
  const hasCustomer = !!item?.customer?._id;

  let amountTextStyle = applyStyles('text-700', {
    fontSize: 16,
    color: colors['gray-300'],
  });
  let customerTextStyle = applyStyles('text-400', {
    fontSize: 16,
    color: colors['gray-300'],
  });

  if (!isPaid) {
    amountTextStyle = {...amountTextStyle, color: colors['red-200']};
    customerTextStyle = {...customerTextStyle, ...applyStyles('text-700')};
  }

  if (!hasCustomer) {
    customerTextStyle = {
      ...customerTextStyle,
      ...applyStyles('text-400'),
      color: colors['gray-100'],
    };
  }

  return (
    <View
      style={applyStyles('px-md flex-row center justify-space-between', {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: colors['gray-20'],
      })}>
      <View>
        <Text style={customerTextStyle}>
          {item?.customer?.name ?? 'No Customer'}
        </Text>
      </View>
      <View>
        <Text style={amountTextStyle}>
          {amountWithCurrency(item.total_amount)}
        </Text>
      </View>
    </View>
  );
};

export const SalesTab = () => {
  const realm = useRealm();
  const allReceipts = getReceipts({realm});

  const getTotalAmount = useCallback(
    (receiptsData: IReceipt[]) =>
      receiptsData.reduce((acc, receipt) => acc + receipt.total_amount, 0),
    [],
  );

  const sortReceipts = useCallback(
    (receiptsData: IReceipt[]) =>
      sortBy(receiptsData, [
        function (o) {
          return o.total_amount === o.amount_paid;
        },
      ]),
    [],
  );

  const [filter, setFilter] = useState(
    {status: statusFilters[0].value, date: new Date()} || {},
  );
  const [totalAmount, setTotalAmount] = useState(
    getTotalAmount(
      sortReceipts(
        allReceipts.filter(
          (receipt) => receipt.created_at?.getTime() === filter.date.getTime(),
        ),
      ),
    ) || 0,
  );
  const [receipts, setReceipts] = useState(
    sortReceipts(
      allReceipts.filter(
        (receipt) => receipt.created_at?.getTime() === filter.date.getTime(),
      ),
    ) || [],
  );

  const emptyStateText = isToday(filter.date)
    ? "You've made no sales today."
    : 'You made no sales on this day.';

  const handleFilterChange = useCallback(
    (key, value) => {
      setFilter({...filter, [key]: value});
    },
    [filter],
  );

  const handleDateFilter = useCallback(
    (date?: Date) => {
      const filtered = allReceipts.filter((receipt) => {
        if (date && receipt.created_at) {
          return isEqual(
            new Date(format(receipt.created_at, 'MMM dd, yyyy')),
            new Date(format(date, 'MMM dd, yyyy')),
          );
        }
      });
      handleFilterChange('date', date);

      setReceipts(filtered);
      setTotalAmount(getTotalAmount(filtered));
    },
    [getTotalAmount, handleFilterChange, allReceipts],
  );

  const handleStatusFilter = useCallback(
    (status: string) => {
      handleFilterChange('status', status);

      switch (status) {
        case 'all':
          const allSales = sortReceipts(allReceipts);
          setReceipts(allSales);
          setTotalAmount(getTotalAmount(allSales));
          break;
        case 'paid':
          const paidReceipts = allReceipts.filter(
            (receipt) => receipt.total_amount === receipt.amount_paid,
          );
          setReceipts(paidReceipts);
          setTotalAmount(getTotalAmount(paidReceipts));
          break;
        case 'unpaid':
          const unPaidReceipts = allReceipts.filter(
            (receipt) => receipt.total_amount !== receipt.amount_paid,
          );
          setReceipts(unPaidReceipts);
          setTotalAmount(getTotalAmount(unPaidReceipts));
          break;
        default:
          const all = sortReceipts(allReceipts);
          setReceipts(all);
          setTotalAmount(getTotalAmount(all));
          break;
      }
    },
    [allReceipts, getTotalAmount, handleFilterChange, sortReceipts],
  );

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <FilterButtonGroup
        value={filter.status}
        onChange={(status) => handleStatusFilter(status)}>
        <View
          style={applyStyles(
            'py-xl px-sm flex-row center justify-space-between',
          )}>
          {statusFilters.map((filterItem, index) => (
            <FilterButton
              {...filterItem}
              key={`${filterItem.value}-${index}`}
              isChecked={filter.status === filterItem.value}
            />
          ))}
        </View>
      </FilterButtonGroup>
      <View
        style={applyStyles('p-md center flex-row justify-space-between', {
          backgroundColor: colors['gray-300'],
        })}>
        <View>
          <DatePicker
            value={filter.date}
            maximumDate={new Date()}
            onChange={(e: Event, date?: Date) => handleDateFilter(date)}>
            {(toggleShow) => (
              <Touchable onPress={toggleShow}>
                <View style={applyStyles('flex-row center', {height: 40})}>
                  <Icon
                    size={24}
                    name="calendar"
                    type="feathericons"
                    color={colors.white}
                  />
                  <Text
                    style={applyStyles('text-700 px-md', {
                      fontSize: 16,
                      color: colors.white,
                    })}>
                    {isToday(filter.date)
                      ? 'Today'
                      : `${format(filter.date, 'MMM dd, yyyy')}`}
                  </Text>
                  <Icon
                    size={24}
                    type="feathericons"
                    name="chevron-down"
                    color={colors.white}
                  />
                </View>
              </Touchable>
            )}
          </DatePicker>
        </View>
        <View style={applyStyles('items-end')}>
          <Text
            style={applyStyles('text-400 text-uppercase', {
              fontSize: 14,
              color: colors.white,
            })}>
            You sold
          </Text>
          <Text
            style={applyStyles('text-700 text-uppercase', {
              fontSize: 16,
              color: colors.white,
            })}>
            {amountWithCurrency(totalAmount)}
          </Text>
        </View>
      </View>

      <FlatList
        data={receipts}
        initialNumToRender={10}
        renderItem={renderReceiptItem}
        keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
        ListEmptyComponent={
          <EmptyState
            heading="No Sales"
            text={emptyStateText}
            style={applyStyles({paddingTop: 100})}
          />
        }
      />
      <View
        style={applyStyles('flex-row center justify-space-between px-md', {
          height: 80,
          elevation: 100,
          borderTopWidth: 1,
          backgroundColor: colors.white,
          borderTopColor: colors['gray-20'],
        })}>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={() => {}}>
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="plus"
                type="feathericons"
                color={colors.white}
              />
              <Text
                style={applyStyles('text-400 text-uppercase pl-sm', {
                  fontSize: 16,
                  color: colors.white,
                })}>
                Create receipt
              </Text>
            </View>
          </Button>
        </View>
        <View style={applyStyles({width: '48%'})}>
          <Button onPress={() => {}} variantColor="clear">
            <View style={applyStyles('flex-row center')}>
              <Icon
                size={24}
                name="camera"
                type="feathericons"
                color={colors['gray-300']}
              />
              <Text
                style={applyStyles('text-400 text-uppercase pl-sm', {
                  fontSize: 16,
                  color: colors['gray-300'],
                })}>
                snap receipt
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
