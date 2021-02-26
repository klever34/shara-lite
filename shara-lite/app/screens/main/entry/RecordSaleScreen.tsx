import {CalculatorView} from '@/components/CalculatorView';
import {CustomerListItem} from '@/components/CustomerListItem';
import {Page} from '@/components/Page';
import {RecordSaleForm} from '@/components/RecordSaleForm';
import {TitleContainer} from '@/components/TitleContainer';
import {getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {MainStackParamList} from '..';
import {SelectCustomerListItem} from './SelectCustomerScreen';

const strings = getI18nService().strings;

type RecordSaleScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordSale'>;
};

const RecordSaleScreen = ({route}: RecordSaleScreenProps) => {
  const {goBack, customer} = route.params;
  const navigation = useAppNavigation();
  const {saveTransaction} = useTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveRecordSale = useCallback(
    async (payload) => {
      try {
        setIsLoading(true);
        const transaction = await saveTransaction({
          ...payload,
          is_collection: false,
        });
        setIsLoading(false);
        navigation.navigate('TransactionSuccess', {
          transaction,
          onDone: goBack,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [goBack, navigation, saveTransaction],
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
      onSelectCustomer(customer);
    },
    [customer, handleSaveRecordSale],
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
        <RecordSaleForm
          isLoading={isLoading}
          onSubmit={handleSave}
          customer={customer}
        />
      </Page>
    </CalculatorView>
  );
};

export default RecordSaleScreen;
