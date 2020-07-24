import Realm, {UpdateMode} from 'realm';
import {ICustomer} from '../models';
import {IPayment, modelName} from '../models/Payment';
import {generateUniqueId} from '../helpers/utils';
import {savePaymentItem} from './PaymentItemService';

export const getPayments = ({realm}: {realm: Realm}): IPayment[] => {
  return (realm.objects<IPayment>(modelName) as unknown) as IPayment[];
};

export const savePayment = ({
  realm,
  customer,
  type,
  amountPaid,
  totalAmount,
  creditAmount,
  tax,
  products,
}: {
  realm: Realm;
  customer: ICustomer | Customer;
  type: string;
  amountPaid: number;
  totalAmount: number;
  creditAmount: number;
  tax: number;
  products: ReceiptItem[];
}): void => {
  const payment: IPayment = {
    type,
    tax,
    amount_paid: amountPaid,
    total_amount: totalAmount,
    credit_amount: creditAmount,
    id: generateUniqueId(),
    created_at: new Date(),
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

  products.forEach((product) => {
    savePaymentItem({
      realm,
      payment,
      ...product,
    });
  });
};
