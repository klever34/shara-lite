import {AppInput, Button, DatePicker, Text, toNumber} from '@/components';
import {CalculatorInput, CalculatorView} from '@/components/CalculatorView';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import {useFormik} from 'formik';
import {omit} from 'lodash';
import React, {useCallback, useContext, useRef} from 'react';
import {Alert, SafeAreaView, TextInput, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {MainStackParamList} from '..';

const strings = getI18nService().strings;

type EditTransactionScreenProps = {
  route: RouteProp<MainStackParamList, 'EditTransaction'>;
};

export const EditTransactionScreen = (props: EditTransactionScreenProps) => {
  const {route} = props;
  const {transaction} = route.params;
  const navigation = useAppNavigation();
  const {updateTransaction} = useTransaction();
  const {showSuccessToast} = useContext(ToastContext);

  const handleSave = useCallback(
    async (updates) => {
      if (updates.amount_paid || updates.credit_amount) {
        await updateTransaction({updates, transaction});
        showSuccessToast('TRANSACTION UPDATED');
        navigation.goBack();
      } else {
        Alert.alert(
          strings('warning'),
          strings('transaction.no_credit_or_amount_warning'),
        );
      }
    },
    [transaction, updateTransaction, showSuccessToast, navigation],
  );

  const initialValues = transaction
    ? omit(transaction)
    : {
        note: '',
        amount_paid: undefined,
        credit_amount: undefined,
        transaction_date: new Date(),
      };

  const {values, handleSubmit, handleChange, setFieldValue} = useFormik({
    initialValues,
    onSubmit: ({note, amount_paid, credit_amount, transaction_date}) =>
      handleSave({
        note,
        amount_paid,
        credit_amount,
        transaction_date,
        total_amount: (amount_paid ?? 0) + (credit_amount ?? 0),
      }),
  });
  const noteFieldRef = useRef<TextInput | null>(null);
  const creditAmountFieldRef = useRef<TextInput | null>(null);

  return (
    <CalculatorView>
      <SafeAreaView style={applyStyles('flex-1 bg-white')}>
        <ScrollView
          style={applyStyles('flex-1')}
          keyboardShouldPersistTaps="always">
          <View
            style={applyStyles(
              'flex-row py-8 pr-16 bg-white items-center justify-between',
              {
                borderBottomWidth: 1.5,
                borderBottomColor: colors['gray-20'],
              },
            )}>
            <HeaderBackButton iconName="arrow-left" />
          </View>
          <View style={applyStyles('px-16')}>
            <View style={applyStyles('pt-16 pb-32')}>
              <Text style={applyStyles('text-gray-300 text-400 text-xl')}>
                {strings('edit_transaction')}
              </Text>
            </View>
            <View>
              <View
                style={applyStyles(
                  'pb-16 flex-row items-center justify-between',
                )}>
                <View style={applyStyles({width: '48%'})}>
                  <CalculatorInput
                    label={strings('sale.fields.amount.label')}
                    placeholder="0.00"
                    returnKeyType="next"
                    value={values.amount_paid}
                    onChangeText={(text) => {
                      const value = toNumber(text);
                      setFieldValue('amount_paid', value);
                    }}
                    onEquals={() => {
                      setImmediate(() => {
                        if (creditAmountFieldRef.current) {
                          creditAmountFieldRef.current.focus();
                        }
                      });
                    }}
                    autoFocus
                  />
                </View>
                <View style={applyStyles({width: '48%'})}>
                  <CalculatorInput
                    ref={creditAmountFieldRef}
                    placeholder="0.00"
                    label={strings('sale.fields.credit.label')}
                    returnKeyType="next"
                    value={values.credit_amount}
                    style={applyStyles('text-red-100')}
                    iconStyle={applyStyles('text-red-100')}
                    onChangeText={(text) => {
                      const value = toNumber(text);
                      setFieldValue('credit_amount', value);
                    }}
                    onEquals={() => {
                      setImmediate(() => {
                        if (noteFieldRef.current) {
                          noteFieldRef.current.focus();
                        }
                      });
                    }}
                  />
                </View>
              </View>
              {!!(values.amount_paid || values.credit_amount) && (
                <Text
                  style={applyStyles(
                    'pb-16 text-700 text-center text-uppercase text-black',
                  )}>
                  {strings('total')}:{' '}
                  {amountWithCurrency(
                    (values.amount_paid ?? 0) + (values.credit_amount ?? 0),
                  )}
                </Text>
              )}
              {!!(values.amount_paid || values.credit_amount) && (
                <AppInput
                  multiline
                  ref={noteFieldRef}
                  value={values.note}
                  label={`${strings('sale.fields.note.label')} (${strings(
                    'optional',
                  )})`}
                  onChangeText={handleChange('note')}
                  containerStyle={applyStyles('pb-16')}
                  placeholder={strings('sale.fields.note.placeholder')}
                />
              )}
              <View
                style={applyStyles(
                  `pb-80 flex-row items-center ${
                    values.amount_paid || values.credit_amount
                      ? 'justify-between'
                      : 'justify-end'
                  }`,
                )}>
                {!!(values.amount_paid || values.credit_amount) && (
                  <View style={applyStyles({width: '48%'})}>
                    <Text style={applyStyles('pb-4 text-700 text-gray-50')}>
                      {strings('date')}
                    </Text>
                    <DatePicker
                      //@ts-ignore
                      maximumDate={new Date()}
                      value={values.transaction_date ?? new Date()}
                      onChange={(e: Event, date?: Date) =>
                        !!date && setFieldValue('transaction_date', date)
                      }>
                      {(toggleShow) => (
                        <Touchable onPress={toggleShow}>
                          <View
                            style={applyStyles(
                              'px-8 py-16 flex-row items-center',
                              {
                                borderWidth: 2,
                                borderRadius: 8,
                                borderColor: colors['gray-20'],
                              },
                            )}>
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
                              {!!values.transaction_date &&
                                format(values.transaction_date, 'MMM dd, yyyy')}
                            </Text>
                          </View>
                        </Touchable>
                      )}
                    </DatePicker>
                  </View>
                )}
                <Button
                  onPress={handleSubmit}
                  style={applyStyles('mt-20', {width: '48%'})}
                  title={
                    transaction.customer ? strings('save') : strings('next')
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CalculatorView>
  );
};
