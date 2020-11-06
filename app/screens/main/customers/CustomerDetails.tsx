import {Button, HeaderRight, HomeContainer, Header} from '@/components';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService} from '@/services';
import {CustomerContext} from '@/services/customer';
import {useErrorHandler} from '@/services/error-boundary';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {addWeeks, format, isThisWeek, isToday, isYesterday} from 'date-fns';
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {TextStyle} from 'react-native';
import {CustomersStackParamList} from '@/screens/main/customers';
import {applyStyles} from '@/styles';
import {MainStackParamList} from '..';
import {Page} from '@/components/Page';
import {ReceiptListItem} from '@/screens/main/receipts/ReceiptListItem';
import {amountWithCurrency, prepareValueForSearch} from '@/helpers/utils';

type CustomerDetailsProps = ModalWrapperFields & {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerDetails'
  >;
};

const CustomerDetails = ({route, openModal}: CustomerDetailsProps) => {
  const navigation = useNavigation();
  const {customer} = route.params;

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
        <HeaderRight menuOptions={[{text: 'Help', onSelect: () => {}}]} />
      ),
    });
  }, [
    customer.receipts,
    getReceiptItemLeftText,
    handleListItemSelect,
    navigation,
    openModal,
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredReceipts = useMemo(() => {
    let customerReceipts = customer.receipts?.sorted('created_at', true);
    if (searchTerm) {
      // @ts-ignore
      customerReceipts = customerReceipts?.filter((receipt) => {
        return (
          (prepareValueForSearch(receipt.total_amount).search(searchTerm) ??
            -1) !== -1 ||
          (prepareValueForSearch(receipt.amount_paid).search(searchTerm) ??
            -1) !== -1 ||
          (prepareValueForSearch(receipt.credit_amount).search(searchTerm) ??
            -1) !== -1
        );
      });
    }
    return customerReceipts;
  }, [customer.receipts, searchTerm]);

  const footer = filteredReceipts?.length ? (
    <Button title="Create Receipt" />
  ) : null;

  const handleReceiptItemSelect = useCallback(
    (receipt: IReceipt) => {
      navigation.navigate('ReceiptDetails', {
        id: receipt._id,
        header: (
          <Header
            title={
              customer.remainingCreditAmount
                ? `Owes you: ${amountWithCurrency(
                    customer.remainingCreditAmount,
                  )}`
                : `Total: ${amountWithCurrency(customer.totalAmount)}`
            }
            iconLeft={{}}
          />
        ),
      });
    },
    [customer.remainingCreditAmount, customer.totalAmount, navigation],
  );

  const renderReceiptItem = useCallback(
    ({item: receipt}: {item: IReceipt}) => {
      return (
        <ReceiptListItem
          receipt={receipt}
          onPress={() => handleReceiptItemSelect(receipt)}
          getReceiptItemLeftText={(currentReceipt) => {
            return currentReceipt?.created_at
              ? format(currentReceipt?.created_at, 'eeee dd MMMM, yyyy')
              : '';
          }}
          getReceiptItemRightText={(currentReceipt) => {
            return currentReceipt?.created_at
              ? format(currentReceipt?.created_at, 'hh:mm aa')
              : '';
          }}
        />
      );
    },
    [handleReceiptItemSelect],
  );

  const handleReceiptSearch = useCallback((text) => {
    setSearchTerm(text);
  }, []);

  return (
    <CustomerContext.Provider value={customer}>
      <Page
        header={{title: customer.name, iconLeft: {}}}
        footer={footer}
        style={applyStyles('px-0 py-0')}>
        <HomeContainer<IReceipt>
          initialNumToRender={10}
          createEntityButtonIcon="file-text"
          data={(filteredReceipts as unknown) as IReceipt[]}
          searchPlaceholderText="Search Receipts"
          createEntityButtonText="Create Receipt"
          keyExtractor={(item, index) => `${item?._id?.toString()}-${index}`}
          emptyStateProps={{
            heading: `Create your first Receipt for ${customer.name}`,
            text:
              'You have no receipts yet. Let’s help you create one it takes only a few seconds.',
          }}
          renderListItem={renderReceiptItem}
          onSearch={handleReceiptSearch}
          showFAB={false}
        />
      </Page>
    </CustomerContext.Provider>
  );
};

export default withModal(CustomerDetails);
