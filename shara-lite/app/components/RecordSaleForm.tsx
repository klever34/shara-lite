import {
  AppInput,
  Button,
  CurrencyInput,
  DatePicker,
  toNumber,
} from '@/components';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {amountWithCurrency} from '@/helpers/utils';
import {IReceipt} from '@/models/Receipt';
import {applyStyles, colors} from '@/styles';
import {format} from 'date-fns';
import {useFormik} from 'formik';
import {omit} from 'lodash';
import React, {useRef} from 'react';
import {Text, TextInput, View} from 'react-native';

type RecordSaleFormProps = {
  transaction?: IReceipt;
  onSubmit: (payload: {
    note?: string;
    amount_paid?: number;
    total_amount?: number;
    credit_amount?: number;
    transaction_date?: Date;
  }) => void;
};

export const RecordSaleForm = (props: RecordSaleFormProps) => {
  const {onSubmit, transaction} = props;
  const initialValues = transaction
    ? omit(transaction)
    : {
        note: '',
        amount_paid: undefined,
        total_amount: undefined,
        credit_amount: undefined,
        transaction_date: new Date(),
      };

  const {values, handleSubmit, handleChange, setFieldValue} = useFormik({
    initialValues,
    onSubmit: ({
      amount_paid,
      credit_amount,
      total_amount,
      note,
      transaction_date,
    }) =>
      onSubmit({
        amount_paid,
        credit_amount,
        total_amount,
        note,
        transaction_date,
      }),
  });
  const noteFieldRef = useRef<TextInput | null>(null);
  const creditAmountFieldRef = useRef<TextInput | null>(null);
  const total_amount =
    values.amount_paid && values.credit_amount
      ? values.amount_paid + values.credit_amount
      : 0;

  return (
    <View>
      <View style={applyStyles('pb-16 flex-row items-center justify-between')}>
        <View style={applyStyles({width: '48%'})}>
          <CurrencyInput
            label="Collected"
            placeholder="0.00"
            returnKeyType="next"
            value={values.amount_paid}
            onChangeText={(text) => {
              const value = toNumber(text);
              setFieldValue('amount_paid', value);
              setFieldValue(
                'total_amount',
                values.credit_amount ? values.credit_amount + value : 0,
              );
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
            value={values.credit_amount}
            style={applyStyles('text-red-100')}
            iconStyle={applyStyles('text-red-100')}
            onChangeText={(text) => {
              const value = toNumber(text);
              setFieldValue('credit_amount', value);
              setFieldValue(
                'total_amount',
                values.amount_paid ? values.amount_paid + value : 0,
              );
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
      {(values.amount_paid || values.credit_amount) && (
        <Text
          style={applyStyles(
            'pb-16 text-700 text-center text-uppercase text-black',
          )}>
          Total: {amountWithCurrency(total_amount)}
        </Text>
      )}
      {(values.amount_paid || values.credit_amount) && (
        <AppInput
          multiline
          value={values.note}
          label="Note (optional)"
          onChangeText={handleChange('note')}
          containerStyle={applyStyles('pb-16')}
          placeholder="Write a brief note about this transaction"
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
        {(values.amount_paid || values.credit_amount) && (
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
        )}
        <Button
          onPress={handleSubmit}
          title={transaction ? 'Save' : 'Next'}
          style={applyStyles('mt-20', {width: '48%'})}
        />
      </View>
    </View>
  );
};
