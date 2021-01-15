import {UpdateMode} from 'realm';
import perf from '@react-native-firebase/perf';
import sub from 'date-fns/sub';
import add from 'date-fns/sub';
import omit from 'lodash/omit';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {
  IPaymentReminder,
  modelName,
  ReminderWhen,
} from '@/models/PaymentReminder';
import {ICustomer} from '@/models';
import {getAnalyticsService} from '@/services';

interface getPaymentRemindersInterface {
  customer: ICustomer;
}

interface savePaymentReminderInterface {
  paymentReminder: IPaymentReminder;
}

interface updatePaymentReminderInterface {
  paymentReminder: IPaymentReminder;
  updates: Partial<IPaymentReminder>;
}

interface deletePaymentReminderInterface {
  paymentReminder: IPaymentReminder;
}

interface usePaymentReminderInterface {
  getPaymentReminders: (
    params: getPaymentRemindersInterface,
  ) => IPaymentReminder[];
  savePaymentReminder: (
    data: savePaymentReminderInterface,
  ) => Promise<IPaymentReminder>;
  updatePaymentReminder: (
    data: updatePaymentReminderInterface,
  ) => Promise<void>;
  deletePaymentReminder: (
    data: deletePaymentReminderInterface,
  ) => Promise<void>;
}

export const usePaymentReminder = (): usePaymentReminderInterface => {
  const realm = useRealm();

  const getPaymentReminders = ({
    customer,
  }: getPaymentRemindersInterface): IPaymentReminder[] => {
    return (realm
      .objects<IPaymentReminder>(modelName)
      .sorted('created_at', false)
      .filtered(
        `is_deleted != true AND customer = ${customer._id}`,
      ) as unknown) as IPaymentReminder[];
  };

  const savePaymentReminder = async ({
    paymentReminder,
  }: savePaymentReminderInterface): Promise<IPaymentReminder> => {
    const due_date = calculateDueDate({
      paymentReminder,
      customer: paymentReminder.customer,
    });

    const updatedPaymentReminder: IPaymentReminder = {
      ...paymentReminder,
      due_date,
      ...getBaseModelValues(),
    };

    const trace = await perf().startTrace('savePaymentReminder');
    realm.write(() => {
      realm.create<IPaymentReminder>(
        modelName,
        updatedPaymentReminder,
        UpdateMode.Modified,
      );
    });

    await trace.stop();
    getAnalyticsService()
      .logEvent('userAddedReminder', {
        id: String(updatedPaymentReminder._id ?? ''),
        amount: updatedPaymentReminder.amount,
        when: updatedPaymentReminder.when,
        unit: updatedPaymentReminder.unit,
        due_date: updatedPaymentReminder.due_date?.toISOString() ?? '',
        customer: String(updatedPaymentReminder.customer._id ?? ''),
      })
      .then(() => {});

    return paymentReminder;
  };

  const updatePaymentReminder = async ({
    paymentReminder,
    updates,
  }: updatePaymentReminderInterface) => {
    const due_date = calculateDueDate({
      paymentReminder: {...omit(paymentReminder), ...updates},
      customer: paymentReminder.customer,
    });
    const updatedPaymentReminder = {
      _id: paymentReminder._id,
      ...updates,
      due_date,
      updated_at: new Date(),
    } as IPaymentReminder;

    const trace = await perf().startTrace('updatePaymentReminder');
    realm.write(() => {
      realm.create(modelName, updatedPaymentReminder, UpdateMode.Modified);
    });
    await trace.stop();
    getAnalyticsService()
      .logEvent('userUpdatedReminder', {
        id: String(updatedPaymentReminder._id ?? ''),
        amount: updatedPaymentReminder.amount,
        when: updatedPaymentReminder.when,
        unit: updatedPaymentReminder.unit,
        due_date: updatedPaymentReminder.due_date?.toISOString() ?? '',
        customer: String(updatedPaymentReminder.customer._id ?? ''),
      })
      .then(() => {});
  };

  const deletePaymentReminder = async ({
    paymentReminder,
  }: deletePaymentReminderInterface) => {
    await updatePaymentReminder({paymentReminder, updates: {is_deleted: true}});
    getAnalyticsService()
      .logEvent('userRemovedReminder', {
        id: String(paymentReminder._id ?? ''),
        amount: paymentReminder.amount,
        when: paymentReminder.when,
        unit: paymentReminder.unit,
        due_date: paymentReminder.due_date?.toISOString() ?? '',
        customer: String(paymentReminder.customer._id ?? ''),
      })
      .then(() => {});
  };

  const calculateDueDate = ({
    paymentReminder,
    customer,
  }: {
    paymentReminder: IPaymentReminder;
    customer: ICustomer;
  }) => {
    if (!customer.due_date) {
      return;
    }

    const dateFn = paymentReminder.when === ReminderWhen.BEFORE ? sub : add;
    return dateFn(customer.due_date, {
      [paymentReminder.unit]: paymentReminder.amount,
    });
  };

  return {
    getPaymentReminders,
    savePaymentReminder,
    updatePaymentReminder,
    deletePaymentReminder,
  };
};
