import {Text} from '@/components';
import {ICustomer} from '@/models';
import {
  IPaymentReminder,
  ReminderUnit,
  ReminderWhen,
} from '@/models/PaymentReminder';
import {getI18nService} from '@/services';
import {handleError} from '@/services/error-boundary';
import {usePaymentReminder} from '@/services/payment-reminder';
import {applyStyles} from '@/styles';
import BluebirdPromise from 'bluebird';
import {format} from 'date-fns';
import React, {useCallback, useContext, useState} from 'react';
import {View} from 'react-native';
import {Button} from './Button';
import {Checkbox} from './Checkbox';
import {DatePicker} from './DatePicker';
import {ToastContext} from './Toast';

interface ReminderPopupProps {
  onClose(): void;
  customer: ICustomer;
  dueDate?: Date;
  onDone(reminders: IPaymentReminder[]): void;
  handleDueDateChange?(Date?: Date): Promise<void>;
}

const strings = getI18nService().strings;

export const ReminderPopup = (props: ReminderPopupProps) => {
  const {
    customer,
    onClose,
    onDone,
    dueDate: dueDateProp,
    handleDueDateChange,
  } = props;

  const {
    getPaymentReminders,
    savePaymentReminder,
    deletePaymentReminder,
    disableCustomerReminders,
  } = usePaymentReminder();
  const {showSuccessToast} = useContext(ToastContext);

  const [dueDate, setDueDate] = useState<Date | undefined>(dueDateProp);
  const [reminders, setReminders] = useState<IPaymentReminder[]>(
    getPaymentReminders({customer}),
  );
  const [noReminders, setNoReminders] = useState(customer.disable_reminders);

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
      try {
        if (noReminders) {
          setNoReminders(false);
          await disableCustomerReminders({customer, disable_reminders: false});
        }
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
      } catch (error) {
        handleError(error);
      }
    },
    [
      dueDate,
      customer,
      noReminders,
      showSuccessToast,
      getPaymentReminders,
      savePaymentReminder,
      disableCustomerReminders,
    ],
  );

  const handleDeleteReminder = useCallback(
    async (reminder) => {
      try {
        await deletePaymentReminder({paymentReminder: reminder});
        showSuccessToast(strings('payment_reminder.reminder_removed'));
        setReminders(getPaymentReminders({customer}));
      } catch (error) {
        handleError(error);
      }
    },
    [customer, showSuccessToast, deletePaymentReminder, getPaymentReminders],
  );

  const handleDeleteReminders = useCallback(async () => {
    try {
      await BluebirdPromise.each(reminders || [], async (reminder) => {
        await deletePaymentReminder({paymentReminder: reminder});
      });
      setReminders(getPaymentReminders({customer}));
    } catch (error) {
      handleError(error);
    }
  }, [customer, reminders, deletePaymentReminder, getPaymentReminders]);

  const handleCheckReminder = useCallback(
    (value?: number) => {
      if (value) {
        const exisitingReminder = findReminder(value);
        if (exisitingReminder) {
          handleDeleteReminder(exisitingReminder);
          return;
        }
        handleAddReminder(value);
      }
    },
    [findReminder, handleAddReminder, handleDeleteReminder],
  );

  const handleDisableReminders = useCallback(async () => {
    try {
      if (!noReminders) {
        setNoReminders(true);
        await disableCustomerReminders({customer, disable_reminders: true});
        await handleDeleteReminders();
        showSuccessToast(strings('payment_reminder.no_reminder.added'));
      } else {
        setNoReminders(false);
        await disableCustomerReminders({customer, disable_reminders: false});
        showSuccessToast(strings('payment_reminder.no_reminder.removed'));
      }
    } catch (error) {
      handleError(error);
    }
  }, [
    customer,
    noReminders,
    showSuccessToast,
    handleDeleteReminders,
    disableCustomerReminders,
  ]);

  const handleEnableReminders = useCallback(async () => {
    try {
      setNoReminders(false);
      await disableCustomerReminders({customer, disable_reminders: false});
    } catch (error) {
      handleError(error);
    }
  }, [customer, disableCustomerReminders]);

  const handleDateChange = useCallback(
    (date?: Date) => {
      setDueDate(date);
      handleDueDateChange && handleDueDateChange(date);
    },
    [handleDueDateChange],
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
      {dueDate ? (
        <View style={applyStyles('px-16')}>
          <Checkbox
            value={noReminders}
            isChecked={noReminders}
            onChange={handleDisableReminders}
            containerStyle={applyStyles('justify-between mb-16')}
            leftLabel={
              <Text
                style={applyStyles(
                  'text-base text-black',
                  noReminders ? 'text-700' : 'text-400',
                )}>
                None (No reminder will be sent)
              </Text>
            }
          />
          <Checkbox
            value=""
            disabled={!noReminders}
            isChecked={!noReminders}
            onChange={handleEnableReminders}
            containerStyle={applyStyles('justify-between mb-16')}
            leftLabel={
              <Text
                style={applyStyles(
                  'text-400 text-base',
                  !noReminders ? ' text-gray-100' : 'text-black',
                )}>
                Collection Day (Default)
              </Text>
            }
          />
          {options.map(({value, label}, index) => (
            <Checkbox
              value={value}
              key={`${label}-${index}`}
              onChange={handleCheckReminder}
              isChecked={!!findReminder(value)}
              containerStyle={applyStyles('justify-between mb-16')}
              leftLabel={
                <Text
                  style={applyStyles(
                    'text-base text-black',
                    findReminder(value) ? 'text-700' : 'text-400',
                  )}>
                  {label}
                </Text>
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
        {dueDate ? (
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
            onChange={(e: Event, date?: Date) => handleDateChange(date)}>
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
