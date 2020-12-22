import {AppInput, Button, DatePicker, toNumber} from '@/components';
import {CalculatorInput, CalculatorView} from '@/components/CalculatorView';
import {CustomerListItem} from '@/components/CustomerListItem';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {TitleContainer} from '@/components/TitleContainer';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {MainStackParamList} from '@/screens/main';
import {handleError} from '@/services/error-boundary';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import {useFormik} from 'formik';
import React, {useCallback, useContext} from 'react';
import {Text, View} from 'react-native';

type RecordCollectionScreenProps = {
  route: RouteProp<MainStackParamList, 'RecordCollection'>;
};

const RecordCollectionScreen = ({route}: RecordCollectionScreenProps) => {
  const {customer, goBack} = route.params;
  const navigation = useAppNavigation();
  const {saveTransaction} = useTransaction();
  const {showSuccessToast} = useContext(ToastContext);

  const handleSaveCollection = useCallback(
    async (payload) => {
      try {
        const transaction = await saveTransaction({
          customer,
          ...payload,
          credit_amount: 0,
          is_collection: true,
          total_amount: payload.amount_paid,
        });
        showSuccessToast('COLLECTION RECORDED');
        navigation.navigate('TransactionSuccess', {
          transaction,
          onDone: goBack,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [goBack, navigation, customer, saveTransaction, showSuccessToast],
  );

  const {handleSubmit, values, handleChange, setFieldValue} = useFormik({
    initialValues: {
      note: '',
      amount_paid: undefined,
      transaction_date: new Date(),
    },
    onSubmit: ({note, amount_paid, transaction_date}) => {
      handleSaveCollection({note, amount_paid, transaction_date});
    },
  });
  return (
    <CalculatorView>
      <Page header={{iconLeft: {}, title: ' '}}>
        <TitleContainer
          title="Record Collection"
          description="Quickly record a transaction or obligation"
          containerStyle={applyStyles('mb-8')}
        />
        <CustomerListItem
          customer={customer}
          containerStyle={applyStyles('py-16 mb-16')}
        />
        <CalculatorInput
          placeholder="0.00"
          label="Enter Amount"
          value={values.amount_paid}
          containerStyle={applyStyles('mb-16')}
          onChangeText={(text) => {
            const value = toNumber(text);
            setFieldValue('amount_paid', value);
          }}
          autoFocus
        />
        {!!values.amount_paid && (
          <AppInput
            multiline
            label="Note (Optional)"
            containerStyle={applyStyles('mb-24')}
            onChangeText={handleChange('note')}
            placeholder="Write a brief note about this transaction"
          />
        )}
        <View
          style={applyStyles(
            `flex-row items-end ${
              values.amount_paid ? 'justify-between' : 'justify-end'
            }`,
          )}>
          {!!values.amount_paid && (
            <DatePicker
              value={new Date(values.transaction_date)}
              containerStyle={applyStyles({width: '48%'})}
              onChange={(e: Event, date?: Date) =>
                !!date && setFieldValue('transaction_date', date)
              }>
              {(toggleShow) => {
                return (
                  <>
                    <Text
                      style={applyStyles(
                        'text-sm text-500 text-gray-50 pb-8 flex-1',
                      )}>
                      Date
                    </Text>
                    <Touchable onPress={toggleShow}>
                      <View
                        style={applyStyles('px-8 py-16 flex-row items-center', {
                          borderWidth: 2,
                          borderRadius: 8,
                          borderColor: colors['gray-20'],
                        })}>
                        <Icon
                          size={16}
                          name="calendar"
                          type="feathericons"
                          color={colors['gray-50']}
                        />
                        <Text
                          style={applyStyles(
                            'pl-sm text-xs text-uppercase text-700 text-gray-300',
                          )}>
                          {format(
                            new Date(values.transaction_date),
                            'MMM dd, yyyy',
                          )}
                        </Text>
                      </View>
                    </Touchable>
                  </>
                );
              }}
            </DatePicker>
          )}
          <Button
            title="Save"
            onPress={handleSubmit}
            style={applyStyles({width: '48%'})}
          />
        </View>
      </Page>
    </CalculatorView>
  );
};

export default RecordCollectionScreen;
