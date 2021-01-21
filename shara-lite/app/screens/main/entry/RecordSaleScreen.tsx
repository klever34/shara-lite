import {Button} from '@/components';
import {CalculatorView} from '@/components/CalculatorView';
import {CustomerListItem} from '@/components/CustomerListItem';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {RecordSaleForm} from '@/components/RecordSaleForm';
import {TitleContainer} from '@/components/TitleContainer';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {MainStackParamList} from '..';
import {SelectCustomerListItem} from './SelectCustomerScreen';

const strings = getI18nService().strings;

type RecordSaleScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordSale'>;
} & ModalWrapperFields;

const RecordSaleScreen = withModal(
  ({route, openModal}: RecordSaleScreenProps) => {
    const {goBack, customer} = route.params;
    const navigation = useAppNavigation();
    const {saveTransaction} = useTransaction();

    const handleSaveRecordSale = useCallback(
      async (payload) => {
        try {
          const transaction = await saveTransaction({
            ...payload,
            is_collection: false,
          });
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
        const onSelectCustomer = (
          selectedCustomer?: SelectCustomerListItem,
        ) => {
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

    const handleOpenPhotoComingSoonModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['red-200']}
              style={applyStyles('mb-40')}
            />
            <Text style={applyStyles('mb-40 text-center text-700')}>
              {strings('collection.coming_soon_select_a_photo')}
            </Text>
            <Button
              onPress={closeModal}
              title={strings('dismiss')}
              variantColor="transparent"
              style={applyStyles({width: 140})}
            />
          </View>
        ),
      });
    }, [openModal]);

    const handleOpenRecurrenceComingSoonModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['red-200']}
              style={applyStyles('mb-40')}
            />
            <Text style={applyStyles('mb-40 text-center text-700')}>
              {strings('payment_reminder.coming_soon_recurring_reminders')}
            </Text>
            <Button
              onPress={closeModal}
              title={strings('dismiss')}
              variantColor="transparent"
              style={applyStyles({width: 140})}
            />
          </View>
        ),
      });
    }, [openModal]);

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
            onSubmit={handleSave}
            customer={customer}
            onOpenRecurrenceComingSoonModal={
              handleOpenRecurrenceComingSoonModal
            }
            onOpenPhotoComingSoonModal={handleOpenPhotoComingSoonModal}
          />
        </Page>
      </CalculatorView>
    );
  },
);

export default RecordSaleScreen;
