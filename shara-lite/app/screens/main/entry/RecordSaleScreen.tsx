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
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

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
        showSuccessToast(strings('sale.sale_recorded'));
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
          withCustomer: !!payload.credit_amount,
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
          title={strings('sale.header.title')}
          containerStyle={applyStyles('pb-24')}
          description={strings('sale.header.description')}
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
