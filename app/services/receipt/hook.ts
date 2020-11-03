import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import {useRealm} from '@/services/realm';
import {ICustomer} from '@/models';
import {Customer, Payment} from 'types/app';
import {IReceiptItem} from '@/models/ReceiptItem';
import {IReceipt, modelName} from '@/models/Receipt';
import {getBaseModelValues} from '@/helpers/models';
import {saveCustomer} from '@/services/customer';
import {
  getAnalyticsService,
  getAuthService,
  getGeolocationService,
} from '@/services';
import {saveReceiptItem} from '@/services/ReceiptItemService';
import {restockProduct} from '@/services/ProductService';
import {convertToLocationString} from '@/services/geolocation';
import {savePayment} from '@/services/PaymentService';
import {saveCredit} from '@/services/CreditService';

interface saveReceiptInterface {
  note?: string;
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
}

interface updateReceiptInterface {
  customer: ICustomer;
  receipt: IReceipt;
}

interface cancelReceiptInterface {
  receipt: IReceipt;
  cancellation_reason: String;
}

interface getAllPaymentsInterface {
  receipt: IReceipt;
}

interface getReceiptInterface {
  receiptId: ObjectId;
}

interface useReceiptInterface {
  saveReceipt: (data: saveReceiptInterface) => void;
  getReceipts: () => IReceipt[];
}

interface useReceiptInterface {
  getReceipts: () => IReceipt[];
  saveReceipt: (data: saveReceiptInterface) => void;
  updateReceipt: (data: updateReceiptInterface) => void;
  cancelReceipt: (params: cancelReceiptInterface) => void;
  getAllPayments: (params: getAllPaymentsInterface) => Array<any>;
  getReceipt: (params: getReceiptInterface) => IReceipt;
  getReceiptsTotalAmount: (receipt: IReceipt[]) => number;
  getReceiptsTotalProductQuantity: (receiptsData: IReceipt[]) => number;
}

export const useReceipt = (): useReceiptInterface => {
  const realm = useRealm();

  const getReceipts = (): IReceipt[] => {
    return (realm
      .objects<IReceipt>(modelName)
      .filtered('is_deleted = false') as unknown) as IReceipt[];
  };

  const saveReceipt = async ({
    customer,
    amountPaid,
    tax,
    note,
    dueDate,
    totalAmount,
    creditAmount,
    payments,
    receiptItems,
    local_image_url,
    image_url,
  }: saveReceiptInterface) => {
    const receipt: IReceipt = {
      tax,
      note,
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
        amount: String(receipt.total_amount),
        currency_code: getAuthService().getUser()?.currency_code ?? '',
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
        currency_code: getAuthService().getUser()?.currency_code ?? '',
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

  const updateReceiptRecord = ({
    receipt,
    updates,
  }: {
    receipt: IReceipt;
    updates: object;
  }) => {
    const updatedReceipt = {
      _id: receipt._id,
      ...updates,
      updated_at: new Date(),
    };

    realm.create(modelName, updatedReceipt, UpdateMode.Modified);
  };

  const updateReceipt = ({customer, receipt}: updateReceiptInterface): void => {
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

  const cancelReceipt = ({
    receipt,
    cancellation_reason,
  }: cancelReceiptInterface): void => {
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

  const getAllPayments = ({receipt}: getAllPaymentsInterface) => {
    return [
      ...(receipt.payments || []),
      ...getPaymentsFromCredit({credits: receipt.credits}),
    ];
  };

  const getReceipt = ({receiptId}: getReceiptInterface) => {
    // @ts-ignore
    return realm.objectForPrimaryKey(modelName, receiptId) as IReceipt;
  };

  const getReceiptsTotalAmount = (receiptsData: IReceipt[]) =>
    receiptsData.reduce((acc, receipt) => acc + receipt.total_amount, 0);

  const getReceiptsTotalProductQuantity = (receiptsData: IReceipt[]) =>
    receiptsData
      .filter((receipt) => !receipt.is_cancelled)
      .reduce(
        (acc, receipt) => [...acc, ...(receipt.items ?? [])],
        [] as IReceiptItem[],
      )
      .reduce((acc, recepitItem) => acc + recepitItem.quantity, 0);

  return {
    getReceipts,
    saveReceipt,
    updateReceipt,
    cancelReceipt,
    getAllPayments,
    getReceipt,
    getReceiptsTotalAmount,
    getReceiptsTotalProductQuantity,
  };
};
