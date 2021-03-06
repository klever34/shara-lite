import {Button, Header, HeaderRight, HomeContainer} from '@/components';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {IReceipt} from '@/models/Receipt';
import {getAnalyticsService} from '@/services';
import {CustomerContext} from '@/services/customer';
import {useErrorHandler} from '@/services/error-boundary';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/stack';
import {addWeeks, format, isThisWeek, isToday, isYesterday} from 'date-fns';
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {Alert, TextStyle} from 'react-native';
import {CustomersStackParamList} from '@/screens/main/customers';
import {applyStyles} from '@/styles';
import {MainStackParamList} from '..';
import {Page} from '@/components/Page';
import {ReceiptListItem} from '@/screens/main/receipts/ReceiptListItem';
import {amountWithCurrency, prepareValueForSearch} from '@/helpers/utils';
import {useReceiptProvider} from '../receipts/ReceiptProvider';
import {getReceipts} from '@/services/ReceiptService';
import {useRealm} from '@/services/realm';
import {useReports} from '@/services/reports';
import {ToastContext} from '@/components/Toast';

type CustomerDetailsProps = ModalWrapperFields & {
  route: RouteProp<
    CustomersStackParamList & MainStackParamList,
    'CustomerDetails'
  >;
};

const CustomerDetails = ({route, openModal}: CustomerDetailsProps) => {
  const realm = useRealm();
  const navigation = useNavigation();
  const {handleUpdateCreateReceiptFromCustomer} = useReceiptProvider();
  const {exportReportsToExcel} = useReports();
  const {showSuccessToast} = useContext(ToastContext);

  const receipts = realm ? getReceipts({realm}) : [];

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
  }, [
    customer.receipts,
    getReceiptItemLeftText,
    handleListItemSelect,
    navigation,
    openModal,
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const [customerReceipts, setCustomerReceipts] = useState(customer.receipts);
  useEffect(() => {
    return navigation.addListener('focus', () => {
      setCustomerReceipts(customer.receipts);
    });
  }, [customer.receipts, navigation, realm]);

  const filteredReceipts = useMemo(() => {
    let nextCustomerReceipts = customerReceipts?.sorted('created_at', true);
    if (searchTerm) {
      // @ts-ignore
      nextCustomerReceipts = nextCustomerReceipts?.filter((receipt) => {
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
    return nextCustomerReceipts;
  }, [customerReceipts, searchTerm]);

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

  const handleCreateReceipt = useCallback(() => {
    if (!receipts.length) {
      handleUpdateCreateReceiptFromCustomer(customer);
      navigation.navigate('BuildReceipt');
    } else {
      handleUpdateCreateReceiptFromCustomer(customer);
      navigation.navigate('CreateReceipt', {receipt: {customer}});
    }
  }, [
    receipts.length,
    handleUpdateCreateReceiptFromCustomer,
    customer,
    navigation,
  ]);

  const handleReportsDownload = useCallback(async () => {
    try {
      const receiptsToDownload = (customer.receipts as unknown) as IReceipt[];
      await exportReportsToExcel({receipts: receiptsToDownload});
      showSuccessToast('Report downloaded successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [customer, exportReportsToExcel, showSuccessToast]);

  const footer = filteredReceipts?.length ? (
    <Button title="Create Receipt" onPress={handleCreateReceipt} />
  ) : null;

  return (
    <CustomerContext.Provider value={customer}>
      <Page
        header={{
          title: customer.name,
          iconLeft: {},
          headerRight: {
            menuOptions: [
              {
                text: 'Edit',
                onSelect: () => {
                  navigation.navigate('AddCustomer', {
                    title: 'Edit Customer',
                    customer,
                  });
                },
              },
              {
                text: 'Download reports',
                onSelect: handleReportsDownload,
              },
            ],
          },
        }}
        footer={footer}
        style={applyStyles('px-0 py-0')}>
        <HomeContainer<IReceipt>
          headerImage={require('@/assets/images/shara-user-img.png')}
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
          onCreateEntity={handleCreateReceipt}
        />
      </Page>
    </CustomerContext.Provider>
  );
};

export default withModal(CustomerDetails);
