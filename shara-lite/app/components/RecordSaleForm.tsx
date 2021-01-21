import {Button, DatePicker, Text, toNumber} from '@/components';
import {CalculatorInput} from '@/components/CalculatorView';
import {ModalWrapperFields, withModal} from '@/helpers/hocs';
import {amountWithCurrency} from '@/helpers/utils';
import {ICustomer} from '@/models';
import {IPaymentReminder} from '@/models/PaymentReminder';
import {IReceipt} from '@/models/Receipt';
import {getAuthService, getI18nService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {usePaymentReminder} from '@/services/payment-reminder';
import {useTransaction} from '@/services/transaction';
import {applyStyles, colors, dimensions} from '@/styles';
import {format, isToday} from 'date-fns';
import {useFormik} from 'formik';
import {omit} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TextInput, View} from 'react-native';
import Config from 'react-native-config';
import {CircleWithIcon} from './CircleWithIcon';
import {EditableInput} from './EditableInput';
import {Icon} from './Icon';
import {ReminderPopup} from './ReminderPopup';
import {TouchableActionItem} from './TouchableActionItem';

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
} & ModalWrapperFields;

export const RecordSaleForm = withModal((props: RecordSaleFormProps) => {
  const {onSubmit, customer, transaction, openModal} = props;
  const navigation = useAppNavigation();
  const {updateDueDate} = useTransaction();
  const user = getAuthService().getUser();
  const {getPaymentReminders} = usePaymentReminder();
  const businessInfo = getAuthService().getBusinessInfo();

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
  const [dueDate, setDueDate] = useState<Date | undefined>(customer?.due_date);
  const [reminders, setReminders] = useState<IPaymentReminder[]>(
    customer ? getPaymentReminders({customer}) : [],
  );

  const paymentLink =
    businessInfo.slug &&
    `${Config.WEB_BASE_URL}/pay/${businessInfo.slug}${
      customer?._id ? `?customer=${String(customer?._id)}` : ''
    }`;

  const paymentReminderMessage = strings('payment_reminder.message', {
    customer_name: customer?.name ?? '',
    extra_salutation:
      businessInfo?.name || user?.firstname
        ? strings('payment_reminder.thank_you_for_doing_business', {
            business_name: businessInfo.name ?? user?.firstname ?? '',
          })
        : '',
    you_owe:
      customer?.balance && customer.balance < 0
        ? strings('payment_reminder.you_owe', {
            balance: amountWithCurrency(customer.balance),
          })
        : '',
    due_on: dueDate
      ? strings('payment_reminder.due_on', {
          due_date: format(new Date(dueDate), 'MMM dd, yyyy'),
        })
      : '',
    pay_at: paymentLink
      ? strings('payment_reminder.pay_at', {link: paymentLink})
      : '',
  });

  const handleOpenSelectCustomer = useCallback(() => {
    navigation.navigate('SelectCustomerList', {
      onSelectCustomer: (customer?: ICustomer) =>
        navigation.navigate('RecordSale', {customer}),
    });
  }, [navigation]);

  const handleOpenPhotoComingSoonModal = useCallback(() => {
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
            {strings('collection.coming_soon_select_a_photo')}
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

  const handleOpenRecurrenceComingSoonModal = useCallback(() => {
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
          onClose={closeModal}
          onDone={setReminders}
          handleDueDateChange={handleDueDateChange}
          customer={customer ? customer : ({} as ICustomer)}
        />
      ),
    });
  }, [openModal, customer, dueDate, handleDueDateChange]);

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

  useEffect(() => {
    if (customer) {
      setDueDate(customer.due_date);
      setReminders(getPaymentReminders({customer}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

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
      <View style={applyStyles('pb-12')}>
        <View style={applyStyles('py-12 flex-row items-center')}>
          <CircleWithIcon icon="edit-2" style={applyStyles('mr-12')} />
          <EditableInput
            multiline
            onChangeText={handleChange('note')}
            label={strings('sale.fields.note.placeholder')}
            labelStyle={applyStyles('text-400 text-lg text-gray-300')}
            placeholder={strings('sale.fields.note.placeholder')}
            style={applyStyles('h-45', {
              width: dimensions.fullWidth - 68,
            })}
          />
        </View>
        <TouchableActionItem
          icon="user"
          style={applyStyles('py-12 px-0 items-center')}
          leftSection={{
            title: customer
              ? customer.name
              : strings('sale.select_customer.title'),
          }}
          onPress={handleOpenSelectCustomer}
        />
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
        {customer && !!values.credit_amount && (
          <>
            <DatePicker
              //@ts-ignore
              minimumDate={new Date()}
              value={dueDate ?? new Date()}
              onChange={(e: Event, date?: Date) => handleDueDateChange(date)}>
              {(toggleShow) => (
                <TouchableActionItem
                  icon="calendar"
                  onPress={toggleShow}
                  style={applyStyles('py-12 px-0')}
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
            <TouchableActionItem
              icon="bell"
              style={applyStyles('py-12 px-0 items-center')}
              leftSection={{
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
              }}
              rightSection={{
                title: reminders.length
                  ? reminders.length > 1
                    ? `${reminders.length} ${strings('reminder_text.other')}`
                    : `${reminders.length} ${strings('reminder_text.one')}`
                  : '',
              }}
              onPress={handleOpenReminderPopup}
            />
            <TouchableActionItem
              icon="mail"
              style={applyStyles('py-12 px-0')}
              leftSection={{
                title: strings('reminder_message_title'),
                caption: paymentReminderMessage,
                captionNumberOfLines: 1,
              }}
              onPress={handleOpenReminderMessageModal}
            />
          </>
        )}
        <TouchableActionItem
          icon="image"
          style={applyStyles('py-12 px-0 items-center')}
          leftSection={{
            title: strings('collection.select_a_photo_text'),
          }}
          onPress={handleOpenPhotoComingSoonModal}
        />
        <TouchableActionItem
          icon="refresh-cw"
          style={applyStyles('py-12 px-0 items-center')}
          leftSection={{
            title: strings('recurrence_title'),
            caption: strings('recurrence_description'),
          }}
          onPress={handleOpenRecurrenceComingSoonModal}
        />
      </View>
      {!customer && !!values.credit_amount && (
        <Text style={applyStyles('text-sm text-400 text-red-100 text-center')}>
          Select a customer to complete this transaction
        </Text>
      )}
      <Button
        onPress={handleSubmit}
        style={applyStyles('mt-20')}
        disabled={!!values.credit_amount && !customer}
        title={customer ? strings('save') : strings('next')}
      />
    </View>
  );
});
