import Realm, {UpdateMode} from 'realm';
import {ICustomer} from 'app-v1/models';
import {IReceipt, modelName} from 'app-v1/models/Receipt';
import {saveReceiptItem} from './ReceiptItemService';
import {savePayment, updatePayment} from './PaymentService';
import {getBaseModelValues} from 'app-v1/helpers/models';
import {saveCredit, updateCredit} from './CreditService';
import {Customer, Payment} from 'types-v1/app';
import {IReceiptItem} from 'app-v1/models/ReceiptItem';
import {getPaymentsFromCredit} from './CreditPaymentService';
import {saveCustomer} from './customer/service';
import {
  getAnalyticsService,
  getAuthService,
  getGeolocationService,
} from 'app-v1/services';
import {restockProduct} from 'app-v1/services/ProductService';
import {convertToLocationString} from 'app-v1/services/geolocation';

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
