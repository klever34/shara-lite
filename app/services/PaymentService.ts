import Realm, {UpdateMode} from 'realm';
import {ICustomer} from '../models';
import {IPayment, modelName} from '../models/Payment';
import {IReceipt} from '../models/Receipt';

export const getPayments = ({realm}: {realm: Realm}): IPayment[] => {
  return (realm.objects<IPayment>(modelName) as unknown) as IPayment[];
};

export const savePayment = ({
  realm,
  customer,
  receipt,
  type,
  method,
  note,
  amount,
}: {
  realm: Realm;
  customer: ICustomer | Customer;
  receipt?: IReceipt;
  type: string;
  method: string;
  note?: string;
  amount: number;
}): IPayment => {
  const payment: IPayment = {
    type,
    method,
    note,
    receipt,
    amount_paid: amount,
  };

  if (customer.name) {
    payment.customer_name = customer.name;
    payment.customer_mobile = customer.mobile;
  }

  if (customer.id) {
    payment.customer = customer as ICustomer;
  }

  realm.write(() => {
    realm.create<IPayment>(modelName, payment, UpdateMode.Modified);
  });

  return payment;
};
