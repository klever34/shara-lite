import {Button, DatePicker} from '@/components';
import {HeaderBackButton} from '@/components/HeaderBackButton';
import {Icon} from '@/components/Icon';
import {ToastContext} from '@/components/Toast';
import Touchable from '@/components/Touchable';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {
  IPaymentReminder,
  ReminderUnit,
  ReminderWhen,
} from '@/models/PaymentReminder';
import {useAppNavigation} from '@/services/navigation';
import {usePaymentReminder} from '@/services/payment-reminder';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, SafeAreaView, ScrollView, Text, View} from 'react-native';
import {MainStackParamList} from '..';
import {ReminderForm} from './ReminderForm';
import {getI18nService} from '@/services';

const strings = getI18nService().strings;

type ReminderSettingsScreenProps = {
  route: RouteProp<MainStackParamList, 'ReminderSettings'>;
} & ModalWrapperFields;

export const ReminderSettingsScreen = withModal(
  ({route, openModal}: ReminderSettingsScreenProps) => {
    const {customer} = route.params;
    const navigation = useAppNavigation();
    const {updateDueDate} = useTransaction();
    const [dueDate, setDueDate] = useState<Date | undefined>(
      customer?.due_date,
    );
    const {
      getPaymentReminders,
      savePaymentReminder,
      deletePaymentReminder,
      updatePaymentReminder,
    } = usePaymentReminder();
    const [reminders, setReminders] = useState<IPaymentReminder[]>(
      getPaymentReminders(),
    );

    const {showSuccessToast} = useContext(ToastContext);

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

    const handleAddReminder = useCallback(async () => {
      await savePaymentReminder({
        paymentReminder: {
          amount: 1,
          unit: ReminderUnit.DAYS,
          when: ReminderWhen.AFTER,
          due_date: dueDate,
          customer: customer,
        },
      });
      showSuccessToast(strings('payment_reminder.reminder_added'));
      setReminders(getPaymentReminders());
    }, [
      dueDate,
      customer,
      showSuccessToast,
      getPaymentReminders,
      savePaymentReminder,
    ]);

    const handleDeleteReminder = useCallback(
      async (reminder) => {
        await deletePaymentReminder({paymentReminder: reminder});
        showSuccessToast(strings('payment_reminder.reminder_removed'));
        setReminders(getPaymentReminders());
      },
      [showSuccessToast, deletePaymentReminder, getPaymentReminders],
    );

    const handleRemoveReminder = useCallback(
      (reminder) => {
        Alert.alert(
          strings('warning'),
          strings('payment_reminder.confirm_delete'),
          [
            {
              text: strings('no'),
              onPress: () => {},
            },
            {
              text: strings('yes'),
              onPress: () => handleDeleteReminder(reminder),
            },
          ],
        );
      },
      [handleDeleteReminder],
    );

    const handleGoBack = useCallback(() => {
      if (!dueDate || !getPaymentReminders().length) {
        const close = openModal('bottom-half', {
          renderContent: () => (
            <View style={applyStyles('p-16')}>
              <Text
                style={applyStyles(
                  'text-center text-700 text-gray-300 text-base',
                )}>
                {strings('payment_reminder.confirm_exit')}
              </Text>
              <View
                style={applyStyles(
                  'pt-24 flex-row items-center justify-between',
                )}>
                <Button
                  title={strings('yes_proceed')}
                  onPress={() => {
                    close();
                    navigation.goBack();
                  }}
                  variantColor="transparent"
                  style={applyStyles({width: '48%'})}
                />
                <Button
                  title={strings('payment_reminder.set_reminder')}
                  onPress={() => close()}
                  style={applyStyles({width: '48%'})}
                />
              </View>
            </View>
          ),
        });
      } else {
        navigation.goBack();
      }
    }, [dueDate, navigation, openModal, getPaymentReminders]);

    return (
      <SafeAreaView style={applyStyles('flex-1 bg-gray-20')}>
        <View style={applyStyles('p-16 flex-row items-center')}>
          <HeaderBackButton onPress={handleGoBack} />
        </View>
        <ScrollView>
          <View style={applyStyles('pb-32')}>
            <Text
              style={applyStyles(
                'pb-8 px-16 text-uppercase text-700 text-gray-300',
              )}>
              {strings('payment_reminder.collection_settings')}
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
                        {strings('payment_reminder.set_collection_date.title')}
                      </Text>
                      <Text
                        style={applyStyles('text-xs text-gray-200 text-400')}>
                        {strings(
                          'payment_reminder.set_collection_date.description',
                        )}
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
                {strings('payment_reminder.reminder_settings')}
              </Text>
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
                      {strings('payment_reminder.add_reminder.title')}
                    </Text>
                    <Text style={applyStyles('text-xs text-gray-200 text-400')}>
                      {strings('payment_reminder.add_reminder.description')}
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
              <View
                style={applyStyles('p-16 bg-white', {
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderTopColor: colors['gray-20'],
                  borderBottomColor: colors['gray-20'],
                })}>
                <Text
                  style={applyStyles('pb-2 text-400 text-gray-300 text-lg')}>
                  {strings('payment_reminder.default_reminder.title')}
                </Text>
                <Text
                  style={applyStyles('pb-12 text-xs text-gray-200 text-400')}>
                  {strings('payment_reminder.default_reminder.description')}
                </Text>
                <Text style={applyStyles('text-gray-300 text-700')}>
                  {strings('payment_reminder.on_the_day_of_collection')}
                </Text>
              </View>
              {!!reminders.length &&
                reminders.map((reminder, index) => {
                  return (
                    <ReminderForm
                      key={String(reminder._id)}
                      index={index + 1}
                      initialValues={reminder}
                      onSubmit={(values) =>
                        updatePaymentReminder({
                          paymentReminder: reminder,
                          updates: values,
                        })
                      }
                      onDelete={() => handleRemoveReminder(reminder)}
                    />
                  );
                })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  },
);
