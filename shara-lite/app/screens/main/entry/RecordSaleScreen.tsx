import {Page} from '@/components/Page';
import {RecordSaleForm} from '@/components/RecordSaleForm';
import {TitleContainer} from '@/components/TitleContainer';
import {ToastContext} from '@/components/Toast';
import {getAnalyticsService, getAuthService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {MainStackParamList} from '..';
import {SelectCustomerListItem} from './SelectCustomerScreen';
import {CalculatorView} from '@/components/CalculatorView';

type RecordSaleScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordSale'>;
};

const RecordSaleScreen = ({route}: RecordSaleScreenProps) => {
  const {goBack} = route.params;
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
        getAnalyticsService()
          .logEvent('userSavedTransaction', {
            amountPaid: payload.amount_paid,
            totalAmount: payload.total_amount,
            creditAmount: payload.credit_amount,
            currency_code: getAuthService().getUser()?.currency_code ?? '',
          })
          .then(() => {})
          .catch((error) => handleError(error));
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
      navigation.navigate('SelectCustomerList', {
        transaction: payload,
        withCustomer: payload.credit_amount,
        onSelectCustomer: (customer?: SelectCustomerListItem) =>
          handleSaveRecordSale({...payload, customer}),
      });
    },
    [navigation, handleSaveRecordSale],
  );

  return (
    <CalculatorView>
      <Page header={{iconLeft: {}, title: ' '}}>
        <TitleContainer
          title="Record Sale"
          containerStyle={applyStyles('pb-24')}
          description="Quickly record a collection or outstanding"
        />
        <RecordSaleForm onSubmit={handleSave} />
      </Page>
    </CalculatorView>
  );
};

export default RecordSaleScreen;
