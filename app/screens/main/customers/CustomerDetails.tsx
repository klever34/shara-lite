import {useNavigation, RouteProp} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import React, {useCallback, useLayoutEffect, useState, useMemo} from 'react';
import {Text, TextStyle, View} from 'react-native';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {
  FilterButton,
  FilterButtonGroup,
  ReceiptingContainer,
  HeaderRight,
  ReceiptListItem,
} from '@/components';
import {CustomerContext} from '@/services/customer';
import {Icon} from '@/components/Icon';
import {colors} from '@/styles';
import {MainStackParamList} from '@/screens/main';
import {IReceipt} from '@/models/Receipt';
import {CreateReceipt} from '@/screens/receipt';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {getAnalyticsService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {format, isToday, isYesterday, isThisWeek, addWeeks} from 'date-fns';
import {StatusFilter} from 'types/app';
import {getReceiptsTotalAmount} from '@/services/ReceiptService';

const statusFilters: StatusFilter[] = [
  {label: 'All Sales', value: 'all'},
  {label: 'Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  {label: 'Pending', value: 'pending'},
];

type CustomerDetailsProps = ModalWrapperFields & {
  route: RouteProp<MainStackParamList, 'CustomerDetails'>;
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

  const handleOpenModal = useCallback(() => {
    const closeModal = openModal('bottom-half', {
      renderContent: () => (
        <CreateReceipt closeModal={closeModal} initialCustomer={customer} />
      ),
    });
  }, [customer, openModal]);

  const handleError = useErrorHandler();

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
                openModal('search', {
                  items: customer.receipts ?? [],
                  renderItem: ({item}) => {
                    return (
                      <ReceiptListItem
                        receipt={item}
                        handleListItemSelect={handleListItemSelect}
                        getReceiptItemLeftText={getReceiptItemLeftText}
                      />
                    );
                  },
                  setSort: () => {},
                  textInputProps: {placeholder: 'Search Receipts'},
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
    switch (filter) {
      case 'all':
        return '';
      case 'paid':
        return 'total_amount = amount_paid AND is_cancelled = false';
      case 'unpaid':
        return 'total_amount != amount_paid AND is_cancelled = false';
      case 'cancelled':
        return 'is_cancelled = true';
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
        emptyStateText="You have not created any receipt for this customer"
        getReceiptItemLeftText={getReceiptItemLeftText}
        onCreateReceipt={handleOpenModal}
        handleListItemSelect={handleListItemSelect}>
        <FilterButtonGroup value={filter} onChange={handleStatusFilter}>
          <View
            style={applyStyles('py-xl px-sm flex-row center justify-between')}>
            {statusFilters.map((filterItem) => (
              <FilterButton
                {...filterItem}
                key={filterItem.value}
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
