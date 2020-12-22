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
import {Text, View} from 'react-native';

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
    initialValues: initialValues ?? {},
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
            Reminder {index}
          </Text>
          <Text style={applyStyles('pb-12 text-xs text-gray-200 text-400')}>
            We will remind your customer on this day
          </Text>
        </View>
        <Touchable onPress={onDelete}>
          <Icon
            size={18}
            name="trash-2"
            type="feathericons"
            color={colors['gray-50']}
          />
        </Touchable>
      </View>
      <View>
        <View>
          <Picker
            mode="dropdown"
            selectedValue={values.amount}
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
        <View>
          <Picker
            mode="dropdown"
            selectedValue={values.unit}
            onValueChange={(itemValue) => {
              setFieldValue('unit', itemValue);
              submitForm();
            }}>
            <Picker.Item label="Day(s)" value={ReminderUnit.DAYS} />
            <Picker.Item label="Week(s)" value={ReminderUnit.WEEKS} />
            <Picker.Item label="Month(s)" value={ReminderUnit.MONTHS} />
          </Picker>
        </View>
        <View>
          <Picker
            mode="dropdown"
            selectedValue={values.when}
            onValueChange={(itemValue) => {
              setFieldValue('when', itemValue);
              submitForm();
            }}>
            <Picker.Item label="Before" value={ReminderWhen.BEFORE} />
            <Picker.Item label="After" value={ReminderWhen.AFTER} />
          </Picker>
        </View>
      </View>
    </View>
  );
};
