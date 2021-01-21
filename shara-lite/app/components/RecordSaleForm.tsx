import {AppInput, Button, DatePicker, toNumber} from '@/components';
import {CalculatorInput} from '@/components/CalculatorView';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {getI18nService} from '@/services';
import {applyStyles, dimensions} from '@/styles';
import {format, isToday} from 'date-fns';
import {useFormik} from 'formik';
import {omit} from 'lodash';
import React, {useRef} from 'react';
import {TextInput, View} from 'react-native';
import {CircleWithIcon} from './CircleWithIcon';
import {EditableInput} from './EditableInput';
import {TouchableActionItem} from './TouchableActionItem';
import {Text} from '@/components';

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
  onOpenPhotoComingSoonModal?(): void;
  onOpenRecurrenceComingSoonModal?(): void;
};

export const RecordSaleForm = (props: RecordSaleFormProps) => {
  const {
    onSubmit,
    customer,
    transaction,
    onOpenPhotoComingSoonModal,
    onOpenRecurrenceComingSoonModal,
  } = props;
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
      <View style={applyStyles('pb-12')}>
        <View style={applyStyles('py-12 flex-row items-center')}>
          <CircleWithIcon icon="edit-2" style={applyStyles('mr-12')} />
          <EditableInput
            multiline
            onChangeText={handleChange('note')}
            label={strings('collection.fields.note.placeholder')}
            labelStyle={applyStyles('text-400 text-base text-gray-300')}
            placeholder={strings('collection.fields.note.placeholder')}
            style={applyStyles('h-45', {
              width: dimensions.fullWidth - 68,
            })}
          />
        </View>
        <DatePicker
          //@ts-ignore
          minimumDate={new Date()}
          value={values.transaction_date ?? new Date()}
          onChange={(e: Event, date?: Date) =>
            !!date && setFieldValue('transaction_date', date)
          }>
          {(toggleShow) => (
            <TouchableActionItem
              icon="calendar"
              onPress={toggleShow}
              style={applyStyles('py-12 px-0')}
              leftSection={{
                title: isToday(values.transaction_date ?? new Date())
                  ? strings('collection.today_text')
                  : format(
                      values.transaction_date ?? new Date(),
                      'MMM dd, yyyy',
                    ),
                caption: strings('collection.transaction_date_text'),
              }}
            />
          )}
        </DatePicker>
        <TouchableActionItem
          icon="image"
          style={applyStyles('py-12 px-0 items-center')}
          leftSection={{
            title: strings('collection.select_a_photo_text'),
          }}
          onPress={onOpenPhotoComingSoonModal}
        />
        <TouchableActionItem
          icon="refresh-cw"
          style={applyStyles('py-12 px-0 items-center')}
          leftSection={{
            title: strings('recurrence_title'),
            caption: strings('recurrence_description'),
          }}
          onPress={onOpenRecurrenceComingSoonModal}
        />
      </View>
      <Button
        onPress={handleSubmit}
        title={customer ? strings('save') : strings('next')}
        style={applyStyles('mt-20')}
      />
    </View>
  );
};
