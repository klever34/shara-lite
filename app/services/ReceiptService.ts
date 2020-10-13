import {getBaseModelValues} from '@/helpers/models';
import {ICustomer} from '@/models';
import {IReceipt, modelName} from '@/models/Receipt';
import {deleteReceiptItem, saveReceiptItem} from './ReceiptItemService';
import {deletePayment, savePayment, updatePayment} from './PaymentService';
import {deleteCredit, saveCredit, updateCredit} from './CreditService';
import {Customer, Payment} from 'types/app';
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
import {getPaymentsFromCredit} from './CreditPaymentService';
import {saveCustomer} from './customer/service';

export const getReceipts = ({realm}: {realm: Realm}): IReceipt[] => {
  return (realm
    .objects<IReceipt>(modelName)
    .filtered('is_deleted = false') as unknown) as IReceipt[];
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
  local_image_url,
  image_url,
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
  image_url?: string;
  local_image_url?: string;
}) => {
  const receipt: IReceipt = {
    tax,
    amount_paid: amountPaid,
    total_amount: totalAmount,
    credit_amount: creditAmount,
    local_image_url,
    image_url,
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

  return receipt;
};

export const updateReceiptRecord = ({
  realm,
  receipt,
  updates,
}: {
  realm: Realm;
  receipt: IReceipt;
  updates: object;
}) => {
  const updatedReceipt = {
    _id: receipt._id,
    updated_at: new Date(),
    ...updates,
  };

  realm.create(modelName, updatedReceipt, UpdateMode.Modified);
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

    updateReceiptRecord({
      realm,
      receipt,
      updates,
    });

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

export const cancelReceipt = ({
  realm,
  receipt,
  cancellation_reason,
}: {
  realm: Realm;
  receipt: IReceipt;
  cancellation_reason: String;
}): void => {
  realm.write(() => {
    const revertProduct = () => {
      const updates = {
        _id: receipt._id,
        _partition: receipt._partition,
        total_amount: 0,
        credit_amount: 0,
        is_cancelled: true,
        cancellation_reason,
      };

      updateReceiptRecord({
        realm,
        receipt,
        updates,
      });
    };

    const revertStockAndItems = () => {
      receipt.items?.forEach((item) => {
        restockProduct({
          realm,
          product: item.product,
          quantity: item.quantity,
        });

        deleteReceiptItem({realm, receiptItem: item});
      });
    };

    const revertPayment = () => {
      (receipt.payments || []).forEach((payment) => {
        deletePayment({realm, payment});
      });
    };

    const revertCredit = () => {
      if (receipt.credits && receipt.credits.length) {
        deleteCredit({realm, credit: receipt.credits[0]});
      }
    };

    revertProduct();
    revertStockAndItems();
    revertPayment();
    revertCredit();
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

export const getReceiptsTotalAmount = (receiptsData: IReceipt[]) =>
  receiptsData.reduce((acc, receipt) => acc + receipt.total_amount, 0);

export const getReceiptsTotalProductQuantity = (receiptsData: IReceipt[]) =>
  receiptsData
    .filter((receipt) => !receipt.is_cancelled)
    .reduce(
      (acc, receipt) => [...acc, ...(receipt.items ?? [])],
      [] as IReceiptItem[],
    )
    .reduce((acc, recepitItem) => acc + recepitItem.quantity, 0);
