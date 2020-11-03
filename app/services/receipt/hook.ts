import {useRealm} from '@/services/realm';
import {UpdateMode} from 'realm';
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

interface useReceiptInterface {
  saveReceipt: (data: saveReceiptInterface) => void;
}

export const useReceipt = (): useReceiptInterface => {
  const realm = useRealm();

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

  return {
    saveReceipt,
  };
};
