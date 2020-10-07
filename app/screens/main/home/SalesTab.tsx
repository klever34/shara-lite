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
import {getReceipts, saveReceipt} from '@/services/ReceiptService';
import {colors} from '@/styles';
import {format, isEqual, isToday} from 'date-fns';
import {sortBy} from 'lodash';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Text, TextStyle, View} from 'react-native';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import {useErrorHandler} from '@/services/error-boundary';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {CreateReceipt} from '@/screens/receipt';
import {ICustomer} from '@/models';

const statusFilters = [
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
    (status: string, date?: Date) => {
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
          setTotalAmount(getTotalAmount(allSales));
          break;
        case 'paid':
          const paidReceipts = allReceipts
            .filter(
              (receipt) =>
                receipt.total_amount === receipt.amount_paid &&
                !receipt.is_cancelled &&
                !receipt.isPending,
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
          setTotalAmount(getTotalAmount(paidReceipts));
          break;
        case 'unpaid':
          const unPaidReceipts = allReceipts
            .filter(
              (receipt) =>
                receipt.total_amount !== receipt.amount_paid &&
                !receipt.is_cancelled &&
                !receipt.isPending,
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
          setTotalAmount(getTotalAmount(unPaidReceipts));
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
          setTotalAmount(getTotalAmount(cancelledReceipts));
          break;
        case 'pending':
          const pendingReceipts = allReceipts
            .filter((receipt) => receipt.isPending)
            .filter((item) => {
              if (dateFilter && item.created_at) {
                return isEqual(
                  new Date(format(item.created_at, 'MMM dd, yyyy')),
                  new Date(format(dateFilter, 'MMM dd, yyyy')),
                );
              }
            });
          setReceipts(pendingReceipts);
          setTotalAmount(getTotalAmount(pendingReceipts));
          break;
        default:
          const all = sortReceipts(allReceipts);
          setReceipts(all);
          setTotalAmount(getTotalAmount(all));
          break;
      }
    },
    [
      allReceipts,
      filter.date,
      getTotalAmount,
      handleFilterChange,
      sortReceipts,
    ],
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
      setTotalAmount(getTotalAmount(filtered));
    },
    [
      filter.status,
      allReceipts,
      handleFilterChange,
      getTotalAmount,
      handleStatusFilter,
    ],
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

  const handleSnapReceipt = useCallback(() => {
    const options: ImagePickerOptions = {
      noData: true,
      maxWidth: 256,
      maxHeight: 256,
      mediaType: 'photo',
      allowsEditing: true,
    };
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        // do nothing
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        const {uri} = response;
        const extensionIndex = uri.lastIndexOf('.');
        const extension = uri.slice(extensionIndex + 1);
        const allowedExtensions = ['jpg', 'jpeg', 'png'];
        if (!allowedExtensions.includes(extension)) {
          return Alert.alert('Error', 'That file type is not allowed.');
        }
        saveReceipt({
          realm,
          tax: 0,
          payments: [],
          amountPaid: 0,
          totalAmount: 0,
          creditAmount: 0,
          receiptItems: [],
          customer: {} as ICustomer,
          local_image_url: uri,
        });
      }
    });
  }, [realm]);

  const handleOpenCreateReciptModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <CreateReceipt
          closeModal={closeModal}
          onSnapReceipt={handleSnapReceipt}
        />
      ),
    });
  }, [openModal, handleSnapReceipt]);

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
      if (receipt.isPending) {
        customerTextStyle = {
          ...customerTextStyle,
          ...applyStyles('text-400'),
          fontStyle: 'italic',
          color: colors['gray-100'],
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
        onSnapReceipt={handleSnapReceipt}
        onCreateReceipt={handleOpenCreateReciptModal}
        handleListItemSelect={handleListItemSelect}
        getReceiptItemLeftText={getCustomerText}>
        <FilterButtonGroup
          value={filter.status}
          onChange={(status: string) => handleStatusFilter(status)}>
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
