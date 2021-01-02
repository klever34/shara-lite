import {AppInput, Button, DatePicker, toNumber} from '@/components';
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
import {CalculatorInput} from '@/components/CalculatorView';
import {ICustomer} from '@/models';

type RecordSaleFormProps = {
  transaction?: IReceipt;
  onSubmit: (payload: {
    note?: string;
    amount_paid?: number;
    total_amount?: number;
    credit_amount?: number;
    transaction_date?: Date;
  }) => void;
  customer?: ICustomer;
};

export const RecordSaleForm = (props: RecordSaleFormProps) => {
  const {onSubmit, transaction, customer} = props;
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
      onSubmit({
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
    <View>
      <View style={applyStyles('pb-16 flex-row items-center justify-between')}>
        <View style={applyStyles({width: '48%'})}>
          <CalculatorInput
            label="Collected"
            placeholder="0.00"
            returnKeyType="next"
            value={values.amount_paid}
            onChangeText={(text) => {
              const value = toNumber(text);
              setFieldValue('amount_paid', value);
            }}
            onSubmitEditing={() => {
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
            placeholder="0.00"
            label="Outstanding"
            returnKeyType="next"
            value={values.credit_amount}
            style={applyStyles('text-red-100')}
            iconStyle={applyStyles('text-red-100')}
            onChangeText={(text) => {
              const value = toNumber(text);
              setFieldValue('credit_amount', value);
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
      {!!(values.amount_paid || values.credit_amount) && (
        <Text
          style={applyStyles(
            'pb-16 text-700 text-center text-uppercase text-black',
          )}>
          Total:{' '}
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
        {!!(values.amount_paid || values.credit_amount) && (
          <View style={applyStyles({width: '48%'})}>
            <Text style={applyStyles('pb-4 text-700 text-gray-50')}>Date</Text>
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
          title={customer ? 'Save' : 'Next'}
          style={applyStyles('mt-20', {width: '48%'})}
        />
      </View>
    </View>
  );
};