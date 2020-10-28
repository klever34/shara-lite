import {
  FilterButton,
  FilterButtonGroup,
  HeaderRight,
  ReceiptingContainer,
  ReceiptListItem,
} from 'app-v3/components';
import {Icon} from 'app-v3/components/Icon';
import {ModalWrapperFields, withModal} from 'app-v3/helpers/hocs';
import {
  amountWithCurrency,
  applyStyles,
  prepareValueForSearch,
} from 'app-v3/helpers/utils';
import {IReceipt} from 'app-v3/models/Receipt';
import {CreateReceipt} from 'app-v3/screens/main/receipts';
import {getAnalyticsService} from 'app-v3/services';
import {CustomerContext} from 'app-v3/services/customer';
import {useErrorHandler} from 'app-v3/services/error-boundary';
import {getReceiptsTotalAmount} from 'app-v3/services/ReceiptService';
import {colors} from 'app-v3/styles';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {addWeeks, format, isThisWeek, isToday, isYesterday} from 'date-fns';
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {Alert, Text, TextStyle, View} from 'react-native';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import {StatusFilter} from 'types/app';
import {CustomersStackParamList} from 'app-v3/screens/main/customers';

const statusFilters: StatusFilter[] = [
  {label: 'All Sales', value: 'all'},
  {label: 'Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  {label: 'Cancelled', value: 'cancelled'},
  // {label: 'Pending', value: 'pending'},
];

type CustomerDetailsProps = ModalWrapperFields & {
  route: RouteProp<CustomersStackParamList, 'CustomerDetails'>;
};

const CustomerDetails = ({route, openModal}: CustomerDetailsProps) => {
  const navigation = useNavigation();
  const {customer} = route.params;

  const [filter, setFilter] = useState(statusFilters[0].value);

  const handleStatusFilter = useCallback((status: any) => {
    setFilter(status);
  }, []);

  const getReceiptItemLeftText = useCallback(
    (receipt: IReceipt, baseStyle: TextStyle) => {
      let children = '';
      if (receipt.created_at) {
        const createdDate = new Date(
          format(receipt.created_at, 'MMM dd, yyyy'),
        );
        if (isToday(createdDate)) {
          children = 'Today';
        } else if (isYesterday(createdDate)) {
          children = 'Yesterday';
        } else if (isThisWeek(createdDate)) {
          children = format(createdDate, 'iiii');
        } else if (isThisWeek(addWeeks(createdDate, 1))) {
          children = 'Last week ' + format(createdDate, 'iiii');
        } else {
          children = format(createdDate, 'dd MMMM, yyyy');
        }
      }
      return {
        style: baseStyle,
        children,
      };
    },
    [],
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

  const handleOpenModal = useCallback(() => {
    const closeModal = openModal('full', {
      animationInTiming: 0.1,
      animationOutTiming: 0.1,
      renderContent: () => (
        <CreateReceipt
          initialCustomer={customer}
          closeReceiptModal={closeModal}
          onSnapReceipt={handleSnapReceipt}
        />
      ),
    });
  }, [customer, handleSnapReceipt, openModal]);

  const handleError = useErrorHandler();

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.navigate('Customers')} />
      ),
      headerRight: () => (
        <HeaderRight
          options={[
            {
              icon: 'search',
              onPress: () => {
                const closeModal = openModal('search', {
                  items: customer.receipts ?? [],
                  renderItem: ({item, onPress}) => {
                    return (
                      <ReceiptListItem
                        receipt={item}
                        handleListItemSelect={handleListItemSelect}
                        getReceiptItemLeftText={getReceiptItemLeftText}
                        onPress={() => {
                          onPress(item);
                          closeModal();
                        }}
                      />
                    );
                  },
                  setFilter: (item: IReceipt, query) => {
                    // TODO: Improve search algorithm
                    return (
                      (prepareValueForSearch(item.total_amount).search(query) ??
                        -1) !== -1 ||
                      (prepareValueForSearch(item.amount_paid).search(query) ??
                        -1) !== -1 ||
                      (prepareValueForSearch(item.credit_amount).search(
                        query,
                      ) ?? -1) !== -1 ||
                      (prepareValueForSearch(
                        item.created_at
                          ? format(item.created_at, 'dd MMMM, yyyy')
                          : '',
                      ).search(query) ?? -1) !== -1
                    );
                  },
                  textInputProps: {
                    placeholder: 'Search Receipts',
                    autoFocus: true,
                  },
                });
              },
            },
          ]}
          menuOptions={[]}
        />
      ),
    });
  }, [
    customer.receipts,
    getReceiptItemLeftText,
    handleListItemSelect,
    navigation,
    openModal,
  ]);

  const filterQuery = useMemo(() => {
    const isNotPending = 'local_image_url = null OR image_url = null';
    switch (filter) {
      case 'all':
        return '';
      case 'paid':
        return `total_amount = amount_paid AND (${isNotPending})`;
      case 'unpaid':
        return `total_amount != amount_paid AND (${isNotPending})`;
      case 'cancelled':
        return `is_cancelled = true AND (${isNotPending})`;
      case 'pending':
        return `!(${isNotPending})`;
      default:
        return '';
    }
  }, [filter]);

  const filteredReceipts = useMemo(() => {
    let customerReceipts = (customer.receipts as unknown) as Realm.Results<
      IReceipt & Realm.Object
    >;
    if (filterQuery) {
      customerReceipts = customerReceipts.filtered(filterQuery);
    }
    return (customerReceipts.sorted(
      'created_at',
      true,
    ) as unknown) as IReceipt[];
  }, [customer.receipts, filterQuery]);

  const totalAmount = useMemo(() => {
    if (filterQuery) {
      return getReceiptsTotalAmount(filteredReceipts);
    }
    return customer.totalAmount;
  }, [customer.totalAmount, filterQuery, filteredReceipts]);

  return (
    <CustomerContext.Provider value={customer}>
      <ReceiptingContainer
        receipts={filteredReceipts}
        onSnapReceipt={handleSnapReceipt}
        emptyStateText="You have not created any receipt for this customer"
        getReceiptItemLeftText={getReceiptItemLeftText}
        onCreateReceipt={handleOpenModal}
        handleListItemSelect={handleListItemSelect}>
        <FilterButtonGroup value={filter} onChange={handleStatusFilter}>
          <View style={applyStyles('py-lg px-sm flex-row center')}>
            {statusFilters.map((filterItem) => (
              <FilterButton
                {...filterItem}
                key={filterItem.value}
                style={applyStyles('mx-xs', {
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                })}
                isChecked={filter === filterItem.value}
              />
            ))}
          </View>
        </FilterButtonGroup>
        <View
          style={applyStyles('p-md center flex-row justify-between', {
            backgroundColor: colors['gray-300'],
          })}>
          <View style={applyStyles('flex-row center', {height: 40})}>
            <Icon
              size={24}
              name="truck"
              type="feathericons"
              color={colors.white}
            />
            <Text
              style={applyStyles('text-700 px-md', {
                fontSize: 16,
                color: colors.white,
              })}>
              All Sales
            </Text>
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
    </CustomerContext.Provider>
  );
};

export default withModal(CustomerDetails);
