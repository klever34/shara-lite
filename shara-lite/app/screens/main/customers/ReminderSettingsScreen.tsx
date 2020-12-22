import {DatePicker} from '@/components';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields} from '@/helpers/hocs';
import {ReminderUnit, ReminderWhen} from '@/models/PaymentReminder';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {MainStackParamList} from '..';
import {Reminder, ReminderForm} from './ReminderForm';

type ReminderSettingsScreenProps = {
  route: RouteProp<MainStackParamList, 'ReminderSettings'>;
} & ModalWrapperFields;

export const ReminderSettingsScreen = ({
  route,
}: ReminderSettingsScreenProps) => {
  const {customer} = route.params;
  const {updateDueDate} = useTransaction();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>(customer?.due_date);

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

  const handleAddReminder = useCallback(() => {
    setReminders([
      {
        amount: 1,
        unit: ReminderUnit.DAYS,
        when: ReminderWhen.AFTER,
      },
      ...reminders,
    ]);
  }, [reminders]);

  const handleRemoveReminder = useCallback(
    (index) => {
      setReminders(reminders.filter((_, itemIndex) => itemIndex !== index));
    },
    [reminders],
  );

  return (
    <SafeAreaView style={applyStyles('flex-1 bg-gray-20')}>
      <View style={applyStyles('p-16 flex-row items-center')}>
        <HeaderBackButton />
      </View>
      <ScrollView>
        <View style={applyStyles('pb-32')}>
          <Text
            style={applyStyles(
              'pb-8 px-16 text-uppercase text-700 text-gray-300',
            )}>
            Collection settings
          </Text>
          <DatePicker
            //@ts-ignore
            minimumDate={new Date()}
            value={dueDate ?? new Date()}
            onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
            {(toggleShow) => (
              <Touchable onPress={toggleShow}>
                <View
                  style={applyStyles(
                    'p-16 flex-row bg-white items-center justify-between',
                    {
                      borderTopWidth: 1,
                      borderBottomWidth: 1,
                      borderTopColor: colors['gray-20'],
                      borderBottomColor: colors['gray-20'],
                    },
                  )}>
                  <View style={applyStyles('flex-1')}>
                    <Text
                      style={applyStyles(
                        'pb-2 text-400 text-gray-300 text-lg',
                      )}>
                      Set Collection Date
                    </Text>
                    <Text style={applyStyles('text-xs text-gray-200 text-400')}>
                      Select the day for customer to pay back
                    </Text>
                  </View>

                  <Text
                    style={applyStyles(
                      'pl-sm text-uppercase text-700 text-gray-300',
                    )}>
                    {!!dueDate && format(dueDate, 'MMM dd, yyyy')}
                  </Text>
                </View>
              </Touchable>
            )}
          </DatePicker>
        </View>

        {dueDate && (
          <View>
            <Text
              style={applyStyles(
                'pb-8 px-16 text-uppercase text-700 text-gray-300',
              )}>
              Reminder settings
            </Text>
            <View
              style={applyStyles('p-16 bg-white', {
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderTopColor: colors['gray-20'],
                borderBottomColor: colors['gray-20'],
              })}>
              <Text style={applyStyles('pb-2 text-400 text-gray-300 text-lg')}>
                Default Reminder
              </Text>
              <Text style={applyStyles('pb-12 text-xs text-gray-200 text-400')}>
                We will send a reminder automatically on the collection date
              </Text>
              <Text style={applyStyles('text-gray-300 text-700')}>
                On the day of collection
              </Text>
            </View>
            {!!reminders.length &&
              reminders.map((reminder, index) => (
                <ReminderForm
                  key={`${index}`}
                  index={index + 1}
                  initialValues={reminder}
                  onSubmit={(values) => console.log(values)}
                  onDelete={() => handleRemoveReminder(index)}
                />
              ))}
            <Touchable onPress={handleAddReminder}>
              <View
                style={applyStyles(
                  'px-16 py-8 flex-row bg-white items-center justify-between',
                  {
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderTopColor: colors['gray-20'],
                    borderBottomColor: colors['gray-20'],
                  },
                )}>
                <View style={applyStyles('flex-1')}>
                  <Text
                    style={applyStyles('pb-2 text-400 text-red-200 text-lg')}>
                    Add Reminder
                  </Text>
                  <Text style={applyStyles('text-xs text-gray-200 text-400')}>
                    Tap here to create a new reminder. You can create as many as
                    you want.
                  </Text>
                </View>
                <Icon
                  size={24}
                  name="plus"
                  type="feathericons"
                  color={colors['red-100']}
                />
              </View>
            </Touchable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
