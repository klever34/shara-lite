import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {ICustomer} from '@/models';
import {Customer} from 'types/app';
import {IReceipt} from '@/models/Receipt';
import {getBaseModelValues} from '@/helpers/models';
import {IPayment, modelName} from '@/models/Payment';
import perf from '@react-native-firebase/perf';

interface savePaymentInterface {
  customer: ICustomer | Customer;
  receipt?: IReceipt;
  type: string;
  method: string;
  note?: string;
  amount: number;
}

interface updatePaymentInterface {
  payment: IPayment;
  updates: object;
}

interface deletePaymentInterface {
  payment: IPayment;
}

interface usePaymentInterface {
  getPayments: () => IPayment[];
  savePayment: (data: savePaymentInterface) => Promise<IPayment>;
  updatePayment: (data: updatePaymentInterface) => void;
  deletePayment: (data: deletePaymentInterface) => void;
}

export const usePayment = (): usePaymentInterface => {
  const realm = useRealm();

  const getPayments = (): IPayment[] => {
    return (realm
      .objects<IPayment>(modelName)
      .filtered('is_deleted != true') as unknown) as IPayment[];
  };

  const savePayment = async ({
    customer,
    receipt,
    type,
    method,
    note,
    amount,
  }: savePaymentInterface): Promise<IPayment> => {
    const payment: IPayment = {
      type,
      method,
      note,
      receipt,
      amount_paid: amount,
      ...getBaseModelValues(),
    };

    if (customer && customer.name) {
      payment.customer_name = customer.name;
      payment.customer_mobile = customer.mobile;
    }

    if (customer && customer._id) {
      payment.customer = customer as ICustomer;
    }

    const trace = await perf().startTrace('savePayment');
    realm.write(() => {
      realm.create<IPayment>(modelName, payment, UpdateMode.Modified);
    });
    await trace.stop();

    return payment;
  };

  const updatePayment = async ({payment, updates}: updatePaymentInterface) => {
    const updatedPayment = {
      _id: payment._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updatePayment');
    realm.write(() => {
      realm.create(modelName, updatedPayment, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deletePayment = async ({payment}: deletePaymentInterface) => {
    await updatePayment({payment, updates: {is_deleted: true}});
  };

  return {
    getPayments,
    savePayment,
    updatePayment,
    deletePayment,
  };
};
