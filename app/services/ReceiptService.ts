import Realm, {UpdateMode} from 'realm';
import {ICustomer} from '../models';
import {IReceipt, modelName} from '../models/Receipt';
import {saveReceiptItem} from './ReceiptItemService';
import {savePayment, updatePayment} from './PaymentService';
import {getBaseModelValues} from '../helpers/models';
import {saveCredit, updateCredit} from './CreditService';

export const getReceipts = ({realm}: {realm: Realm}): IReceipt[] => {
  return (realm.objects<IReceipt>(modelName) as unknown) as IReceipt[];
};

export const saveReceipt = ({
  realm,
  customer,
  amountPaid,
  tax,
  totalAmount,
  creditAmount,
  payments,
  products,
}: {
  realm: Realm;
  customer: ICustomer | Customer;
  amountPaid: number;
  totalAmount: number;
  creditAmount: number;
  tax: number;
  payments: Payment[];
  products: ReceiptItem[];
}): void => {
  const receipt: IReceipt = {
    tax,
    amount_paid: amountPaid,
    total_amount: totalAmount,
    credit_amount: creditAmount,
    ...getBaseModelValues(),
  };

  if (customer.name) {
    receipt.customer_name = customer.name;
    receipt.customer_mobile = customer.mobile;
  }

  if (customer.id) {
    receipt.customer = customer as ICustomer;
  }

  realm.write(() => {
    realm.create<IReceipt>(modelName, receipt, UpdateMode.Modified);
  });

  payments.forEach((payment) => {
    savePayment({
      realm,
      customer,
      receipt,
      type: 'receipt',
      ...payment,
    });
  });

  products.forEach((product) => {
    saveReceiptItem({
      realm,
      receipt,
      ...product,
    });
  });

  if (creditAmount > 0) {
    saveCredit({
      creditAmount,
      customer,
      receipt,
      realm,
    });
  }
};

export const updateReceipt = ({
  realm,
  customer,
  receipt,
}: {
  realm: Realm;
  customer: ICustomer;
  receipt: IReceipt;
}): void => {
  realm.write(() => {
    receipt.customer = customer;

    (receipt.payments || []).forEach((payment) => {
      updatePayment({realm, payment, updates: {customer}});
    });

    if (receipt.credit_amount > 0 && receipt.credit) {
      receipt.credit.customer = customer;
      updateCredit({realm, credit: receipt.credit, updates: {customer}});
    }
  });
};
