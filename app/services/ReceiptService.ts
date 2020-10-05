import {getBaseModelValues} from '@/helpers/models';
import {ICustomer} from '@/models';
import {IReceipt, modelName} from '@/models/Receipt';
import {IReceiptItem} from '@/models/ReceiptItem';
import {
  getAnalyticsService,
  getAuthService,
  getGeolocationService,
} from '@/services';
import {convertToLocationString} from '@/services/geolocation';
import {restockProduct} from '@/services/ProductService';
import {ObjectId} from 'bson';
import Realm, {UpdateMode} from 'realm';
import {Customer, Payment} from 'types/app';
import {getPaymentsFromCredit} from './CreditPaymentService';
import {saveCredit, updateCredit} from './CreditService';
import {saveCustomer} from './customer/service';
import {savePayment, updatePayment} from './PaymentService';
import {saveReceiptItem} from './ReceiptItemService';

export const getReceipts = ({realm}: {realm: Realm}): IReceipt[] => {
  return (realm.objects<IReceipt>(modelName) as unknown) as IReceipt[];
};

export const saveReceipt = ({
  realm,
  customer,
  amountPaid,
  tax,
  dueDate,
  totalAmount,
  creditAmount,
  payments,
  receiptItems,
}: {
  realm: Realm;
  dueDate?: Date;
  customer: ICustomer | Customer;
  amountPaid: number;
  totalAmount: number;
  creditAmount: number;
  tax: number;
  payments: Payment[];
  receiptItems: IReceiptItem[];
}) => {
  const receipt: IReceipt = {
    tax,
    amount_paid: amountPaid,
    total_amount: totalAmount,
    credit_amount: creditAmount,
    ...getBaseModelValues(),
  };

  let receiptCustomer: ICustomer | Customer;

  if (customer.name) {
    receipt.customer_name = customer.name;
    receipt.customer_mobile = customer.mobile;
  }

  if (!customer._id && customer.name) {
    receiptCustomer = saveCustomer({realm, customer});
  }
  if (customer._id) {
    receiptCustomer = customer;
    getAnalyticsService()
      .logEvent('customerAddedToReceipt')
      .then(() => {});
  }

  //@ts-ignore
  receipt.customer = receiptCustomer as ICustomer;

  realm.write(() => {
    realm.create<IReceipt>(modelName, receipt, UpdateMode.Modified);

    receiptItems.forEach((receiptItem: IReceiptItem) => {
      saveReceiptItem({
        realm,
        receipt,
        receiptItem,
      });

      restockProduct({
        realm,
        product: receiptItem.product,
        quantity: receiptItem.quantity * -1,
      });
    });
  });
  getAnalyticsService()
    .logEvent('receiptCreated', {
      amount:
        (getAuthService().getUser()?.currency_code ?? '') +
        String(receipt.total_amount),
    })
    .then(() => {});

  getGeolocationService()
    .getCurrentPosition()
    .then((location) => {
      realm.write(() => {
        realm.create<Partial<IReceipt>>(
          modelName,
          {_id: receipt._id, coordinates: convertToLocationString(location)},
          UpdateMode.Modified,
        );
      });
    });

  payments.forEach((payment) => {
    savePayment({
      realm,
      customer: receiptCustomer,
      receipt,
      type: 'receipt',
      ...payment,
    });
    getAnalyticsService().logEvent('paymentMade', {
      method: payment.method,
      amount: payment.amount.toString(),
      item_id: receipt?._id?.toString() ?? '',
    });
  });

  if (creditAmount > 0) {
    saveCredit({
      dueDate,
      creditAmount,
      //@ts-ignore
      customer: receiptCustomer,
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
  if (!receipt.customer) {
    getAnalyticsService()
      .logEvent('customerAddedToReceipt')
      .then(() => {});
  }
  realm.write(() => {
    const updates = {
      customer,
      _id: receipt._id,
      _partition: receipt._partition,
    };
    realm.create(modelName, updates, UpdateMode.Modified);
    (receipt.payments || []).forEach((payment) => {
      updatePayment({realm, payment, updates: {customer}});
    });

    if (
      receipt.credit_amount > 0 &&
      receipt.credits &&
      receipt.credits.length
    ) {
      updateCredit({realm, credit: receipt.credits[0], updates: {customer}});
    }
  });
};

export const getAllPayments = ({receipt}: {receipt: IReceipt}) => {
  return [
    ...(receipt.payments || []),
    ...getPaymentsFromCredit({credits: receipt.credits}),
  ];
};

export const getReceipt = ({
  realm,
  receiptId,
}: {
  realm: Realm;
  receiptId: ObjectId;
}) => {
  // @ts-ignore
  return realm.objectForPrimaryKey(modelName, receiptId) as IReceipt;
};
