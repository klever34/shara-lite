import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {Alert, KeyboardAvoidingView, Text, TextStyle, View} from 'react-native';
import {StatusFilter} from 'types-v3/app';
import {ModalWrapperFields, withModal} from 'app-v3/helpers/hocs';
import {useRealm} from 'app-v3/services/realm';
import {useAppNavigation} from 'app-v3/services/navigation';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {
  getAllPayments,
  getReceipts,
  getReceiptsTotalAmount,
} from 'app-v3/services/ReceiptService';
import {IReceipt} from 'app-v3/models/Receipt';
import {sortBy} from 'lodash';
import {format, isEqual, isToday} from 'date-fns';
import {getAnalyticsService} from 'app-v3/services';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import {CreateReceipt} from 'app-v3/screens/main/receipts';
import {amountWithCurrency} from 'app-v3/helpers/utils';
import {colors} from 'app-v3/styles';
import {
  DatePicker,
  FilterButton,
  FilterButtonGroup,
  HeaderRight,
  ReceiptingContainer,
} from 'app-v3/components';
import Touchable from 'app-v3/components/Touchable';
import {Icon} from 'app-v3/components/Icon';
import {
  HeaderBackButton,
  StackHeaderLeftButtonProps,
} from '@react-navigation/stack';
import {applyStyles} from 'app-v3/styles';

const statusFilters: StatusFilter[] = [
  {label: 'All Sales', value: 'all'},
  {label: 'Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  // {label: 'Pending', value: 'pending'},
  {label: 'Cancelled', value: 'cancelled'},
];

type SalesTabProps = ModalWrapperFields & {};

export const ReceiptListScreen = withModal(({openModal}: SalesTabProps) => {
  const handleError = useErrorHandler();
  const realm = useRealm();
  const navigation = useAppNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: applyStyles('border-b-1', {
        elevation: 0,
      }),
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
                    name="file-text"
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
                    Receipts
                  </Text>
                </View>
              );
            }}
          />
        );
      },
      headerTitle: () => null,
      headerRight: () => (
        <HeaderRight
          menuOptions={[
            {
              text: 'Help',
              onSelect: () => {},
            },
          ]}
        />
      ),
    });
  }, [navigation]);
  const allReceipts = realm ? getReceipts({realm}) : [];

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
            .filter((receipt) => {
              const allPayments = receipt ? getAllPayments({receipt}) : [];
              const totalAmountPaid = allPayments.reduce(
                (total, payment) => total + payment.amount_paid,
                0,
              );
              return (
                receipt.total_amount === totalAmountPaid &&
                !receipt.is_cancelled &&
                !receipt.isPending
              );
            })
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
            .filter((receipt) => {
              const allPayments = receipt ? getAllPayments({receipt}) : [];
              const totalAmountPaid = allPayments.reduce(
                (total, payment) => total + payment.amount_paid,
                0,
              );
              return (
                receipt.total_amount !== totalAmountPaid &&
                !receipt.is_cancelled &&
                !receipt.isPending
              );
            })
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
          setTotalAmount(getReceiptsTotalAmount(pendingReceipts));
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
      if (date) {
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
      }
    },
    [filter.status, allReceipts, handleFilterChange, handleStatusFilter],
  );

  const handleListItemSelect = useCallback(
    (id: IReceipt['_id']) => {
      getAnalyticsService()
        .logEvent('selectContent', {
          content_type: 'Receipt',
          item_id: id?.toString() ?? '',
        })
        .catch(handleError);
      navigation.navigate('SalesDetails', {id});
    },
    [handleError, navigation],
  );

  const handleSnapReceipt = useCallback(
    (callback: (imageUri: string) => void) => {
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
          callback(uri);
        }
      });
    },
    [],
  );

  const handleOpenCreateReciptModal = useCallback(() => {
    const closeCreateReceiptModal = openModal('full', {
      animationInTiming: 0.1,
      animationOutTiming: 0.1,
      renderContent: () => (
        <CreateReceipt
          onSnapReceipt={handleSnapReceipt}
          closeReceiptModal={closeCreateReceiptModal}
        />
      ),
    });
  }, [openModal, handleSnapReceipt]);

  const getCustomerText = useCallback(
    (receipt: IReceipt, customerTextStyle: TextStyle) => {
      const allPayments = receipt ? getAllPayments({receipt}) : [];
      const totalAmountPaid = allPayments.reduce(
        (total, payment) => total + payment.amount_paid,
        0,
      );
      if (receipt.total_amount !== totalAmountPaid) {
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
    handleStatusFilter(filter.status, filter.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allReceipts.length]);

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
        <View
          style={applyStyles('p-md center flex-row justify-between', {
            backgroundColor: colors['gray-300'],
          })}>
          <View>
            <DatePicker
              value={filter.date}
              maximumDate={new Date()}
              onChange={(e: Event, date?: Date) => handleDateFilter(date)}>
              {(toggleShow: any) => (
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
        <View
          style={applyStyles({
            borderBottomWidth: 1,
            borderBottomColor: colors['gray-20'],
          })}>
          <FilterButtonGroup
            value={filter.status}
            onChange={(status: any) => handleStatusFilter(status)}>
            <View style={applyStyles('py-lg px-sm flex-row center')}>
              {statusFilters.map((filterItem) => (
                <FilterButton
                  {...filterItem}
                  key={filterItem.value}
                  style={applyStyles('mx-xs', {
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                  })}
                  isChecked={filter.status === filterItem.value}
                />
              ))}
            </View>
          </FilterButtonGroup>
        </View>
      </ReceiptingContainer>
    </KeyboardAvoidingView>
  );
});

export * from './CreateReceipt';
export * from './ReceiptItemModal';
export * from './ReceiptPreviewModal';
