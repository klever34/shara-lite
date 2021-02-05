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
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

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
          title={customer ? strings('save') : strings('next')}
          style={applyStyles('mt-20', {width: '100%'})}
        />
      </View>
    </View>
  );
};
