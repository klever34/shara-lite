import {
  AppInput,
  Button,
  CurrencyInput,
  DatePicker,
  toNumber,
} from '@/components';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {useAppNavigation} from '@/services/navigation';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import {useFormik} from 'formik';
import {omit} from 'lodash';
import React, {useCallback, useContext, useRef} from 'react';
import {Alert, SafeAreaView, Text, TextInput, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {MainStackParamList} from '..';

type EditTransactionScreenProps = {
  route: RouteProp<MainStackParamList, 'EditTransaction'>;
};

export const EditTransactionScreen = (props: EditTransactionScreenProps) => {
  const {route} = props;
  const {transaction} = route.params;
  const navigation = useAppNavigation();
  const {updateTransaction} = useTransaction();
  const {showSuccessToast} = useContext(ToastContext);
  const initialValues = omit(transaction);

  const handleSave = useCallback(
    async (updates) => {
      if (updates.amount_paid || updates.credit_amount) {
        await updateTransaction({updates, transaction});
        showSuccessToast('TRANSACTION UPDATED');
        navigation.goBack();
      } else {
        Alert.alert(
          'Waring',
          'Please enter collected amount or oustanding amount',
        );
      }
    },
    [transaction, updateTransaction, showSuccessToast, navigation],
  );

  const {values, handleSubmit, handleChange, setFieldValue} = useFormik({
    initialValues,
    onSubmit: ({
      amount_paid,
      credit_amount,
      total_amount,
      note,
      transaction_date,
    }) =>
      handleSave({
        amount_paid,
        credit_amount,
        total_amount,
        note,
        transaction_date,
      }),
  });
  const noteFieldRef = useRef<TextInput | null>(null);
  const creditAmountFieldRef = useRef<TextInput | null>(null);
  const total_amount = values.amount_paid + values.credit_amount;

  return (
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
              Edit Transaction
            </Text>
          </View>
          <View
            style={applyStyles('pb-16 flex-row items-center justify-between')}>
            <View style={applyStyles({width: '48%'})}>
              <CurrencyInput
                label="Collected"
                placeholder="0.00"
                returnKeyType="next"
                value={values.amount_paid ?? 0}
                onChangeText={(text) => {
                  const value = toNumber(text);
                  setFieldValue('amount_paid', value);
                  setFieldValue('total_amount', values.credit_amount + value);
                }}
                onSubmitEditing={() => {
                  setImmediate(() => {
                    if (creditAmountFieldRef.current) {
                      creditAmountFieldRef.current.focus();
                    }
                  });
                }}
              />
            </View>
            <View style={applyStyles({width: '48%'})}>
              <CurrencyInput
                placeholder="0.00"
                label="Outstanding"
                returnKeyType="next"
                value={values.credit_amount ?? 0}
                style={applyStyles('text-red-100')}
                iconStyle={applyStyles('text-red-100')}
                onChangeText={(text) => {
                  const value = toNumber(text);
                  setFieldValue('credit_amount', value);
                  setFieldValue('total_amount', values.amount_paid + value);
                }}
                onSubmitEditing={() => {
                  setImmediate(() => {
                    if (noteFieldRef.current) {
                      noteFieldRef.current.focus();
                    }
                  });
                }}
              />
            </View>
          </View>
          <Text
            style={applyStyles(
              'pb-16 text-700 text-center text-uppercase text-black',
            )}>
            Total: {amountWithCurrency(total_amount)}
          </Text>
          <AppInput
            multiline
            value={values.note}
            label="Note (optional)"
            onChangeText={handleChange('note')}
            containerStyle={applyStyles('pb-16')}
            placeholder="Write a brief note about this transaction"
          />
          <View
            style={applyStyles('flex-row items-center justify-between pb-80')}>
            <View style={applyStyles({width: '48%'})}>
              <Text style={applyStyles('pb-4 text-700 text-gray-50')}>
                Start Date
              </Text>
              <DatePicker
                //@ts-ignore
                maximumDate={new Date()}
                value={values.transaction_date ?? new Date()}
                onChange={(e: Event, date?: Date) =>
                  date && setFieldValue('transaction_date', date)
                }>
                {(toggleShow) => (
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
                        {values.transaction_date &&
                          format(values.transaction_date, 'MMM dd, yyyy')}
                      </Text>
                    </View>
                  </Touchable>
                )}
              </DatePicker>
            </View>
            <Button
              title="Save"
              onPress={handleSubmit}
              style={applyStyles('mt-20', {width: '48%'})}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
