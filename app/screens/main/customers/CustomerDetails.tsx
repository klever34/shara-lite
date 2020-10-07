import {useNavigation, RouteProp} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Text, TextStyle, View} from 'react-native';
import {amountWithCurrency, applyStyles} from '@/helpers/utils';
import {
  FilterButton,
  FilterButtonGroup,
  ReceiptingContainer,
  HeaderRight,
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

const statusFilters = [
  {label: 'All Sales', value: 'all'},
  {label: 'All Unpaid', value: 'unpaid'},
  {label: 'Paid', value: 'paid'},
  {label: 'Pending', value: 'pending'},
];

type CustomerDetailsProps = ModalWrapperFields & {
  route: RouteProp<MainStackParamList, 'CustomerDetails'>;
};

const CustomerDetails = ({route, openModal}: CustomerDetailsProps) => {
  const navigation = useNavigation();
  const {customer} = route.params;

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
                //TODO: Implement search
              },
            },
          ]}
          menuOptions={[]}
        />
      ),
    });
  }, [navigation]);

  const [filter, setFilter] = useState(statusFilters[0].value);

  const handleStatusFilter = useCallback((status) => {
    setFilter(status);
  }, []);

  const getReceiptItemLeftText = useCallback(
    (receipt: IReceipt, baseStyle: TextStyle) => {
      return {
        style: baseStyle,
        children: '',
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

  return (
    <CustomerContext.Provider value={customer}>
      <ReceiptingContainer
        receipts={customer.receipts}
        emptyStateText="You have not created any receipt for this customer"
        getReceiptItemLeftText={getReceiptItemLeftText}
        onCreateReceipt={handleOpenModal}
        handleListItemSelect={handleListItemSelect}>
        <FilterButtonGroup value={filter} onChange={handleStatusFilter}>
          <View
            style={applyStyles(
              'py-xl px-sm flex-row center justify-space-between',
            )}>
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
          style={applyStyles('p-md center flex-row justify-space-between', {
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
              {amountWithCurrency(customer.totalAmount)}
            </Text>
          </View>
        </View>
      </ReceiptingContainer>
    </CustomerContext.Provider>
  );
};

export default withModal(CustomerDetails);
