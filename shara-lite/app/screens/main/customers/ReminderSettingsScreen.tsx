import {Button, DatePicker} from '@/components';
import {Icon} from '@/components/Icon';
import {Page} from '@/components/Page';
import {ReminderPopup} from '@/components/ReminderPopup';
import {TouchableActionItem} from '@/components/TouchableActionItem';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {IPaymentReminder} from '@/models/PaymentReminder';
import {getAnalyticsService, getAuthService, getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {usePaymentReminder} from '@/services/payment-reminder';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors} from '@/styles';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {Text} from '@/components';
import {SafeAreaView, View} from 'react-native';
import Config from 'react-native-config';
import {MainStackParamList} from '..';

const strings = getI18nService().strings;

type ReminderSettingsScreenProps = {
  route: RouteProp<MainStackParamList, 'ReminderSettings'>;
} & ModalWrapperFields;

export const ReminderSettingsScreen = withModal(
  ({route, openModal}: ReminderSettingsScreenProps) => {
    const {customer} = route.params;
    const navigation = useAppNavigation();
    const user = getAuthService().getUser();
    const {updateDueDate} = useTransaction();
    const {getPaymentReminders} = usePaymentReminder();
    const businessInfo = getAuthService().getBusinessInfo();

    const [dueDate, setDueDate] = useState<Date | undefined>(
      customer?.due_date,
    );
    const [reminders, setReminders] = useState<IPaymentReminder[]>(
      getPaymentReminders({customer}),
    );

    const paymentLink =
      businessInfo.slug &&
      `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
        customer._id ? `?customer=${String(customer._id)}` : ''
      }`;

    const paymentReminderMessage = `${strings('salutation', {
      name: customer?.name ?? '',
    })} ${
      businessInfo?.name || user?.firstname
        ? strings('payment_reminder.thank_you_for_doing_business', {
            business_name: businessInfo?.name || user?.firstname,
          })
        : ''
    } ${
      customer.balance && customer.balance < 0
        ? dueDate
          ? strings('you_owe_message_with_due_date', {
              credit_amount: amountWithCurrency(customer.balance),
              due_date: format(new Date(dueDate), 'MMM dd, yyyy'),
            })
          : strings('you_owe_message', {
              credit_amount: amountWithCurrency(customer.balance),
            })
        : ''
    }\n\n${
      paymentLink
        ? strings('payment_link_message', {payment_link: paymentLink})
        : ''
    }\n\n${strings('powered_by_shara')}`;

    const handleOpenComingSoonModal = useCallback(() => {
      getAnalyticsService().logEvent('comingSoonPrompted', {
        feature: 'reminder_settings_recurring_reminders',
      });
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['red-200']}
              style={applyStyles('mb-40')}
            />
            <Text style={applyStyles('mb-40 text-center text-700')}>
              {strings('payment_reminder.coming_soon_recurring_reminders')}
            </Text>
            <Button
              onPress={closeModal}
              title={strings('dismiss')}
              variantColor="transparent"
              style={applyStyles({width: 140})}
            />
          </View>
        ),
      });
    }, [openModal]);

    const handleOpenReminderMessageModal = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <View style={applyStyles('bg-white center py-16 px-32')}>
            <Icon
              size={24}
              name="bell"
              type="feathericons"
              color={colors['red-200']}
              style={applyStyles('mb-40')}
            />
            <Text style={applyStyles('mb-40 text-center text-700')}>
              {paymentReminderMessage}
            </Text>
            <Button
              onPress={closeModal}
              title={strings('dismiss')}
              variantColor="transparent"
              style={applyStyles({width: 140})}
            />
          </View>
        ),
      });
    }, [openModal, paymentReminderMessage]);

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

    const handleOpenReminderPopup = useCallback(() => {
      const closeModal = openModal('bottom-half', {
        renderContent: () => (
          <ReminderPopup
            dueDate={dueDate}
            customer={customer}
            onClose={closeModal}
            onDone={setReminders}
            handleDueDateChange={handleDueDateChange}
          />
        ),
      });
    }, [openModal, customer, dueDate, handleDueDateChange]);

    const handleGoBack = useCallback(() => {
      if (!dueDate || !getPaymentReminders({customer}).length) {
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
    }, [customer, dueDate, navigation, openModal, getPaymentReminders]);

    const options = useMemo(() => {
      return [
        {
          icon: 'bell',
          leftSection: {
            title: reminders.length
              ? strings('reminder_text.one')
              : strings('reminder_text.zero'),
            caption: reminders.length
              ? reminders[0].amount > 1
                ? strings('payment_reminder.reminder_count.other', {
                    count: reminders[0].amount,
                  })
                : strings('payment_reminder.reminder_count.one')
              : strings('payment_reminder.no_reminder_set_text'),
          },
          rightSection: {
            title: reminders.length
              ? reminders.length > 1
                ? `${reminders.length} ${strings('reminder_text.other')}`
                : `${reminders.length} ${strings('reminder_text.one')}`
              : !customer.disable_reminders
              ? strings('default_text')
              : '',
          },
          onPress: handleOpenReminderPopup,
        },
        {
          icon: 'mail',
          leftSection: {
            title: strings('reminder_message_title'),
            caption: paymentReminderMessage,
            captionNumberOfLines: 1,
          },
          onPress: handleOpenReminderMessageModal,
        },
        {
          icon: 'refresh-cw',
          leftSection: {
            title: strings('recurrence_title'),
            caption: strings('recurrence_description'),
          },
          onPress: handleOpenComingSoonModal,
        },
      ];
    }, [
      reminders,
      paymentReminderMessage,
      handleOpenReminderPopup,
      handleOpenComingSoonModal,
      customer.disable_reminders,
      handleOpenReminderMessageModal,
    ]);

    return (
      <SafeAreaView style={applyStyles('flex-1 bg-gray-20')}>
        <Page
          header={{
            iconLeft: {onPress: handleGoBack},
            title: strings('payment_reminder.title'),
          }}
          style={applyStyles('px-0')}>
          <View style={applyStyles('pb-32')}>
            <DatePicker
              //@ts-ignore
              minimumDate={new Date()}
              value={dueDate ?? new Date()}
              onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
              {(toggleShow) => (
                <TouchableActionItem
                  icon="calendar"
                  onPress={toggleShow}
                  rightSection={{
                    title: dueDate ? format(dueDate, 'MMM dd, yyyy') : '',
                  }}
                  leftSection={{
                    title: strings(
                      'payment_reminder.set_collection_date.title',
                    ),
                    caption: strings(
                      'payment_reminder.set_collection_date.description',
                    ),
                  }}
                />
              )}
            </DatePicker>
            <View>
              {options.map((option, index) => {
                return (
                  <TouchableActionItem key={index.toString()} {...option} />
                );
              })}
            </View>
          </View>
        </Page>
      </SafeAreaView>
    );
  },
);
