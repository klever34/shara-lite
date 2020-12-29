import {Page} from '@/components/Page';
import {RecordSaleForm} from '@/components/RecordSaleForm';
import {TitleContainer} from '@/components/TitleContainer';
import {ToastContext} from '@/components/Toast';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {MainStackParamList} from '..';
import {SelectCustomerListItem} from './SelectCustomerScreen';
import {CalculatorView} from '@/components/CalculatorView';
import {CustomerListItem} from '@/components/CustomerListItem';

type RecordSaleScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordSale'>;
};

const RecordSaleScreen = ({route}: RecordSaleScreenProps) => {
  const {goBack, customer} = route.params;
  const navigation = useAppNavigation();
  const {saveTransaction} = useTransaction();
  const {showSuccessToast} = useContext(ToastContext);

  const handleSaveRecordSale = useCallback(
    async (payload) => {
      try {
        const transaction = await saveTransaction({
          ...payload,
          is_collection: false,
        });
        showSuccessToast('SALE RECORDED');
        navigation.navigate('TransactionSuccess', {
          transaction,
          onDone: goBack,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [goBack, navigation, saveTransaction, showSuccessToast],
  );

  const handleSave = useCallback(
    (payload: {
      note?: string;
      amount_paid?: number;
      total_amount?: number;
      credit_amount?: number;
      transaction_date?: Date;
    }) => {
      const onSelectCustomer = (selectedCustomer?: SelectCustomerListItem) => {
        handleSaveRecordSale({...payload, customer: selectedCustomer}).catch(
          handleError,
        );
      };
      if (customer) {
        onSelectCustomer(customer);
      } else {
        navigation.navigate('SelectCustomerList', {
          transaction: payload,
          withCustomer: payload.credit_amount,
          onSelectCustomer,
        });
      }
    },
    [customer, navigation, handleSaveRecordSale],
  );

  return (
    <CalculatorView>
      <Page header={{iconLeft: {}, title: ' '}}>
        <TitleContainer
          title="Record Sale"
          containerStyle={applyStyles('pb-24')}
          description="Quickly record a collection or outstanding"
        />
        {customer && (
          <CustomerListItem
            customer={customer}
            containerStyle={applyStyles('py-16 mb-16')}
            getDateText={() => null}
          />
        )}
        <RecordSaleForm onSubmit={handleSave} customer={customer} />
      </Page>
    </CalculatorView>
  );
};

export default RecordSaleScreen;
