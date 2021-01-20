import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {
  IPaymentReminder,
  ReminderUnit,
  ReminderWhen,
} from '@/models/PaymentReminder';
import {applyStyles, colors} from '@/styles';
import {Picker} from '@react-native-community/picker';
import {useFormik} from 'formik';
import React from 'react';
import {Text} from '@/components';
import {View} from 'react-native';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

export type Reminder = Pick<IPaymentReminder, 'amount' | 'when' | 'unit'>;

export type Props = {
  index: number;
  onDelete: () => void;
  initialValues: Reminder;
  onSubmit: (values: Reminder) => void;
};

export const ReminderForm = ({
  index,
  onDelete,
  initialValues,
  onSubmit,
}: Props) => {
  const {values, setFieldValue, submitForm} = useFormik({
    onSubmit,
    initialValues: {
      when: initialValues.when,
      amount: initialValues.amount,
      unit: initialValues.unit,
    },
  });

  return (
    <View
      style={applyStyles('p-16 bg-white', {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: colors['gray-20'],
        borderBottomColor: colors['gray-20'],
      })}>
      <View style={applyStyles('pb-12 flex-row justify-between')}>
        <View style={applyStyles('flex-1')}>
          <Text style={applyStyles('pb-2 text-400 text-gray-300 text-lg')}>
            {strings('payment_reminder.reminder_count', {count: index})}
          </Text>
          <Text style={applyStyles('pb-12 text-xs text-gray-200 text-400')}>
            {strings('payment_reminder.reminder_description')}
          </Text>
        </View>
        <Touchable onPress={onDelete}>
          <Icon
            size={20}
            name="trash-2"
            type="feathericons"
            color={colors['gray-50']}
          />
        </Touchable>
      </View>
      <View style={applyStyles('flex-row items-center justify-between')}>
        <View
          style={applyStyles('', {
            width: '30%',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors['gray-20'],
          })}>
          <Picker
            mode="dropdown"
            selectedValue={values.amount}
            style={applyStyles({width: '100%'})}
            onValueChange={(itemValue) => {
              setFieldValue('amount', itemValue);
              submitForm();
            }}>
            {Array(30)
              .fill(1)
              .map((_, i) => i + 1)
              .map((item) => (
                <Picker.Item key={`${item}`} label={`${item}`} value={item} />
              ))}
          </Picker>
        </View>
        <View
          style={applyStyles('', {
            width: '33%',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors['gray-20'],
          })}>
          <Picker
            mode="dropdown"
            selectedValue={values.unit}
            style={applyStyles({width: '100%'})}
            onValueChange={(itemValue) => {
              setFieldValue('unit', itemValue);
              submitForm();
            }}>
            <Picker.Item
              label={strings('payment_reminder.reminder_unit.days')}
              value={ReminderUnit.DAYS}
            />
            <Picker.Item
              label={strings('payment_reminder.reminder_unit.weeks')}
              value={ReminderUnit.WEEKS}
            />
            <Picker.Item
              label={strings('payment_reminder.reminder_unit.months')}
              value={ReminderUnit.MONTHS}
            />
          </Picker>
        </View>
        <View
          style={applyStyles('', {
            width: '33%',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors['gray-20'],
          })}>
          <Picker
            mode="dropdown"
            selectedValue={values.when}
            style={applyStyles({width: '100%'})}
            onValueChange={(itemValue) => {
              setFieldValue('when', itemValue);
              submitForm();
            }}>
            <Picker.Item
              label={strings('payment_reminder.reminder_when.before')}
              value={ReminderWhen.BEFORE}
            />
            <Picker.Item
              label={strings('payment_reminder.reminder_when.after')}
              value={ReminderWhen.AFTER}
            />
          </Picker>
        </View>
      </View>
    </View>
  );
};
