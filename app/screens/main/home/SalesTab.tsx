import {
  DatePicker,
  FilterButton,
  FilterButtonGroup,
  ReceiptingContainer,
} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {useRealm} from '@/services/realm';
import {getReceipts, getReceiptsTotalAmount} from '@/services/ReceiptService';
import {colors} from '@/styles';
import {format, isEqual, isToday} from 'date-fns';
import {sortBy} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Text, TextStyle, View} from 'react-native';
import {useErrorHandler} from '@/services/error-boundary';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {CreateReceipt} from '@/screens/receipt';
import {StatusFilter} from 'types/app';

const statusFilters: StatusFilter[] = [
  {label: 'All', value: 'all'},
  {label: 'Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  {label: 'Pending', value: 'pending'},
  {label: 'Cancelled', value: 'cancelled'},
];

type SalesTabProps = ModalWrapperFields & {};

export const SalesTab = withModal(({openModal}: SalesTabProps) => {
  const realm = useRealm();
  const navigation = useAppNavigation();
  const handleError = useErrorHandler();
  const allReceipts = getReceipts({realm});

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
    getReceiptsTotalAmount(
      sortReceipts(
        allReceipts.filter((receipt) => {
          if (filter.date && receipt.created_at) {
            return isEqual(
              new Date(format(receipt?.created_at, 'MMM dd, yyyy')),
              new Date(format(filter.date, 'MMM dd, yyyy')),
            );
          }
        }),
      ),
    ) || 0,
  );
  const [receipts, setReceipts] = useState(
    sortReceipts(
      allReceipts.filter((receipt) => {
        if (filter.date && receipt.created_at) {
          return isEqual(
            new Date(format(receipt?.created_at, 'MMM dd, yyyy')),
            new Date(format(filter.date, 'MMM dd, yyyy')),
          );
        }
      }),
    ) || [],
  );
  const emptyStateText = isToday(filter.date)
    ? "You've made no sales today."
    : 'You made no sales on this day.';

  const handleFilterChange = useCallback((key, value) => {
    setFilter((prevFilter) => ({...prevFilter, [key]: value}));
  }, []);

  const handleStatusFilter = useCallback(
    (status: StatusFilter['value'], date?: Date) => {
      const dateFilter = date || filter.date;
      handleFilterChange('status', status);
      if (date) {
        handleFilterChange('date', date);
      }

      switch (status) {
        case 'all':
          const filteredReceipts = allReceipts.filter((item) => {
            if (dateFilter && item.created_at) {
              return isEqual(
                new Date(format(item.created_at, 'MMM dd, yyyy')),
                new Date(format(dateFilter, 'MMM dd, yyyy')),
              );
            }
          });
          const allSales = sortReceipts(filteredReceipts);
          setReceipts(allSales);
          setTotalAmount(getReceiptsTotalAmount(allSales));
          break;
        case 'paid':
          const paidReceipts = allReceipts
            .filter(
              (receipt) =>
                receipt.total_amount === receipt.amount_paid &&
                !receipt.is_cancelled,
            )
            .filter((item) => {
              if (dateFilter && item.created_at) {
                return isEqual(
                  new Date(format(item.created_at, 'MMM dd, yyyy')),
                  new Date(format(dateFilter, 'MMM dd, yyyy')),
                );
              }
            });
          setReceipts(paidReceipts);
          setTotalAmount(getReceiptsTotalAmount(paidReceipts));
          break;
        case 'unpaid':
          const unPaidReceipts = allReceipts
            .filter(
              (receipt) =>
                receipt.total_amount !== receipt.amount_paid &&
                !receipt.is_cancelled,
            )
            .filter((item) => {
              if (dateFilter && item.created_at) {
                return isEqual(
                  new Date(format(item.created_at, 'MMM dd, yyyy')),
                  new Date(format(dateFilter, 'MMM dd, yyyy')),
                );
              }
            });
          setReceipts(unPaidReceipts);
          setTotalAmount(getReceiptsTotalAmount(unPaidReceipts));
          break;
        case 'cancelled':
          const cancelledReceipts = allReceipts
            .filter((receipt) => receipt.is_cancelled)
            .filter((item) => {
              if (dateFilter && item.created_at) {
                return isEqual(
                  new Date(format(item.created_at, 'MMM dd, yyyy')),
                  new Date(format(dateFilter, 'MMM dd, yyyy')),
                );
              }
            });
          setReceipts(cancelledReceipts);
          setTotalAmount(getReceiptsTotalAmount(cancelledReceipts));
          break;
        default:
          const all = sortReceipts(allReceipts);
          setReceipts(all);
          setTotalAmount(getReceiptsTotalAmount(all));
          break;
      }
    },
    [allReceipts, filter.date, handleFilterChange, sortReceipts],
  );

  const handleDateFilter = useCallback(
    (date?: Date) => {
      if (filter.status) {
        handleStatusFilter(filter.status, date);
        return;
      }
      handleFilterChange('date', date);
      const filtered = allReceipts.filter((receipt) => {
        if (date && receipt.created_at) {
          return isEqual(
            new Date(format(receipt.created_at, 'MMM dd, yyyy')),
            new Date(format(date, 'MMM dd, yyyy')),
          );
        }
      });

      setReceipts(filtered);
      setTotalAmount(getReceiptsTotalAmount(filtered));
    },
    [filter.status, allReceipts, handleFilterChange, handleStatusFilter],
  );

  const handleListItemSelect = useCallback(
    (id: IReceipt['_id']) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          content_type: 'receipt',
          item_id: id?.toString() ?? '',
        })
        .catch(handleError);
      navigation.navigate('SalesDetails', {id});
    },
    [handleError, navigation],
  );

  const handleOpenModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => <CreateReceipt closeModal={closeModal} />,
    });
  }, [openModal]);

  const getCustomerText = useCallback(
    (receipt: IReceipt, customerTextStyle: TextStyle) => {
      if (!receipt.isPaid) {
        customerTextStyle = {
          ...customerTextStyle,
          ...applyStyles('text-700'),
        };
      }
      if (!receipt.hasCustomer) {
        customerTextStyle = {
          ...customerTextStyle,
          ...applyStyles('text-400'),
          color: colors['gray-100'],
        };
      }
      if (receipt.is_cancelled) {
        customerTextStyle = {
          ...customerTextStyle,
          ...applyStyles('text-400'),
          fontStyle: 'italic',
          color: colors['gray-100'],
          textDecorationLine: 'line-through',
        };
      }
      return {
        style: customerTextStyle,
        children: receipt?.customer?.name ?? 'No Customer',
      };
    },
    [],
  );

  useEffect(() => {
    return navigation.addListener('focus', () => {
      const allReceiptsData = getReceipts({realm});
      setReceipts(
        allReceiptsData.filter((receipt) => {
          if (filter.date && receipt.created_at) {
            return isEqual(
              new Date(format(receipt?.created_at, 'MMM dd, yyyy')),
              new Date(format(filter.date, 'MMM dd, yyyy')),
            );
          }
        }),
      );
    });
  }, [filter.date, navigation, realm]);

  return (
    <KeyboardAvoidingView
      style={applyStyles('flex-1', {backgroundColor: colors.white})}>
      <ReceiptingContainer
        receipts={receipts}
        emptyStateText={emptyStateText}
        onCreateReceipt={handleOpenModal}
        handleListItemSelect={handleListItemSelect}
        getReceiptItemLeftText={getCustomerText}>
        <FilterButtonGroup
          value={filter.status}
          onChange={(status: any) => handleStatusFilter(status)}>
          <View
            style={applyStyles(
              'py-xl px-sm flex-row center justify-space-between',
            )}>
            {statusFilters.map((filterItem) => (
              <FilterButton
                {...filterItem}
                key={filterItem.value}
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
      </ReceiptingContainer>
    </KeyboardAvoidingView>
  );
});
