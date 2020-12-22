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
  getPaymentReminders: () => IPaymentReminder[];
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

  const getPaymentReminders = (): IPaymentReminder[] => {
    return (realm
      .objects<IPaymentReminder>(modelName)
      .filtered('is_deleted = false') as unknown) as IPaymentReminder[];
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
    };

    const trace = await perf().startTrace('updatePaymentReminder');
    realm.write(() => {
      realm.create(modelName, updatedPaymentReminder, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deletePaymentReminder = async ({
    paymentReminder,
  }: deletePaymentReminderInterface) => {
    await updatePaymentReminder({paymentReminder, updates: {is_deleted: true}});
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
