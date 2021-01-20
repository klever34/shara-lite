import {ICustomer} from '@/models';
import {
  IPaymentReminder,
  ReminderUnit,
  ReminderWhen,
} from '@/models/PaymentReminder';
import {getI18nService} from '@/services';
import {usePaymentReminder} from '@/services/payment-reminder';
import {useTransaction} from '@/services/transaction';
import {applyStyles} from '@/styles';
import {format} from 'date-fns';
import React, {useCallback, useContext, useState} from 'react';
import {Text, View} from 'react-native';
import {Button} from './Button';
import {Checkbox} from './Checkbox';
import {DatePicker} from './DatePicker';
import {ToastContext} from './Toast';

interface ReminderPopupProps {
  onClose(): void;
  customer: ICustomer;
  onDone(reminders: IPaymentReminder[]): void;
}

const strings = getI18nService().strings;

export const ReminderPopup = (props: ReminderPopupProps) => {
  const {customer, onClose, onDone} = props;

  const {updateDueDate} = useTransaction();
  const {
    getPaymentReminders,
    savePaymentReminder,
    deletePaymentReminder,
  } = usePaymentReminder();
  const {showSuccessToast} = useContext(ToastContext);

  const [dueDate, setDueDate] = useState<Date | undefined>(customer?.due_date);
  const [reminders, setReminders] = useState<IPaymentReminder[]>(
    getPaymentReminders({customer}),
  );

  const handleDone = useCallback(() => {
    onDone(reminders);
    onClose();
  }, [onDone, onClose, reminders]);

  const findReminder = useCallback(
    (value) => {
      return reminders.find((reminder) => reminder.amount === value);
    },
    [reminders],
  );

  const handleAddReminder = useCallback(
    async (amount: number) => {
      await savePaymentReminder({
        paymentReminder: {
          amount,
          unit: ReminderUnit.DAYS,
          when: ReminderWhen.BEFORE,
          due_date: dueDate,
          customer: customer,
        },
      });
      showSuccessToast(strings('payment_reminder.reminder_added'));
      setReminders(getPaymentReminders({customer}));
    },
    [
      dueDate,
      customer,
      showSuccessToast,
      getPaymentReminders,
      savePaymentReminder,
    ],
  );

  const handleDeleteReminder = useCallback(
    async (reminder) => {
      await deletePaymentReminder({paymentReminder: reminder});
      showSuccessToast(strings('payment_reminder.reminder_removed'));
      setReminders(getPaymentReminders({customer}));
    },
    [customer, showSuccessToast, deletePaymentReminder, getPaymentReminders],
  );

  const handleCheckReminder = useCallback(
    (value?: number) => {
      if (value) {
        const exisitingReminder = findReminder(value);
        if (exisitingReminder) {
          handleDeleteReminder(exisitingReminder);
        }
        handleAddReminder(value);
      }
    },
    [findReminder, handleAddReminder, handleDeleteReminder],
  );

  const handleDueDateChange = useCallback(
    async (date?: Date) => {
      if (date) {
        setDueDate(date);
        if (customer) {
          try {
            await updateDueDate({
              customer,
              due_date: date,
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    },
    [customer, updateDueDate],
  );

  const options = [
    {label: strings('reminder_popup.collection_day.one'), value: 1},
    {
      label: strings('reminder_popup.collection_day.other', {count: 2}),
      value: 2,
    },
    {
      label: strings('reminder_popup.collection_day.other', {count: 3}),
      value: 3,
    },
    {
      label: strings('reminder_popup.collection_day.other', {count: 4}),
      value: 4,
    },
    {
      label: strings('reminder_popup.collection_day.other', {count: 5}),
      value: 5,
    },
    {
      label: strings('reminder_popup.collection_day.other', {count: 6}),
      value: 6,
    },
    {
      label: strings('reminder_popup.collection_day.other', {count: 7}),
      value: 7,
    },
  ];

  return (
    <View style={applyStyles('bg-white')}>
      <View style={applyStyles('mb-24')}>
        <Text
          style={applyStyles(
            'pb-2 text-base text-uppercase text-gray-300 text-center text-700',
          )}>
          {strings('reminder_popup.title')}
        </Text>
        {customer.due_date && (
          <Text style={applyStyles('text-gray-100 text-center')}>
            {strings('reminder_popup.collect_on_text', {
              due_date: format(customer.due_date, 'dd MMM, yyyy'),
            })}
          </Text>
        )}
      </View>
      {customer.due_date ? (
        <View style={applyStyles('px-16')}>
          {options.map(({value, label}, index) => (
            <Checkbox
              value={value}
              key={`${label}-${index}`}
              onChange={handleCheckReminder}
              isChecked={!!findReminder(value)}
              containerStyle={applyStyles('justify-between mb-16')}
              leftLabel={
                <Text style={applyStyles('text-400 text-base')}>{label}</Text>
              }
            />
          ))}
        </View>
      ) : (
        <View style={applyStyles('center px-64')}>
          <Text style={applyStyles('text-center text-base text-400 pb-32')}>
            {strings('reminder_popup.no_collection_date_text')}
          </Text>
        </View>
      )}
      <View
        style={applyStyles(
          'flex-row items-center py-16 px-16 justify-between',
        )}>
        <Button
          variantColor="transparent"
          style={applyStyles({
            width: '48%',
          })}
          onPress={onClose}
          title={strings('cancel')}
        />
        {customer.due_date ? (
          <Button
            title={strings('done')}
            onPress={handleDone}
            style={applyStyles({
              width: '48%',
            })}
          />
        ) : (
          <DatePicker
            //@ts-ignore
            style={applyStyles({
              width: '48%',
            })}
            minimumDate={new Date()}
            value={dueDate ?? new Date()}
            onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
            {(toggleShow) => (
              <Button
                onPress={toggleShow}
                title={strings(
                  'reminder_popup.set_collection_date_button_text',
                )}
              />
            )}
          </DatePicker>
        )}
      </View>
    </View>
  );
};
