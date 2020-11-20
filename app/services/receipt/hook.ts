import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import BluebirdPromise from 'bluebird';
import {useRealm} from '@/services/realm';
import {ICustomer} from '@/models';
import {Customer, Payment} from 'types/app';
import {IReceiptItem} from '@/models/ReceiptItem';
import {IReceipt, modelName} from '@/models/Receipt';
import {getBaseModelValues} from '@/helpers/models';
import {
  getAnalyticsService,
  getAuthService,
  getGeolocationService,
} from '@/services';
import {convertToLocationString} from '@/services/geolocation';
import {useCustomer} from '@/services/customer/hook';
import {useReceiptItem} from '@/services/receipt-item';
import {useProduct} from '@/services/product';
import {usePayment} from '@/services/payment';
import {useCredit} from '@/services/credit';
import {useCreditPayment} from '@/services/credit-payment';
import perf from '@react-native-firebase/perf';

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
  getReceipts: () => IReceipt[];
  saveReceipt: (data: saveReceiptInterface) => Promise<IReceipt>;
  updateReceipt: (data: updateReceiptInterface) => Promise<void>;
  cancelReceipt: (params: cancelReceiptInterface) => void;
  getAllPayments: (params: getAllPaymentsInterface) => Array<any>;
  getReceipt: (params: getReceiptInterface) => IReceipt;
  getReceiptsTotalAmount: (receipt: IReceipt[]) => number;
  getReceiptsTotalProductQuantity: (receiptsData: IReceipt[]) => number;
  getReceiptAmounts: (
    receiptData?: IReceipt,
  ) => {totalAmountPaid: number; creditAmountLeft?: number};
}

export const useReceipt = (): useReceiptInterface => {
  const realm = useRealm();
  const {saveCustomer} = useCustomer();
  const {saveReceiptItem, deleteReceiptItem} = useReceiptItem();
  const {restockProduct} = useProduct();
  const {savePayment, updatePayment, deletePayment} = usePayment();
  const {saveCredit, updateCredit, deleteCredit} = useCredit();
  const {getPaymentsFromCredit, deleteCreditPayment} = useCreditPayment();

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
    const fullTrace = await perf().startTrace('saveReceiptFullFlow');

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
      receiptCustomer = await saveCustomer({customer, source: 'manual'});
    }
    if (customer._id) {
      receiptCustomer = customer;
      getAnalyticsService()
        .logEvent('customerAddedToReceipt', {})
        .then(() => {});
    }

    //@ts-ignore
    receipt.customer = receiptCustomer as ICustomer;

    const trace = await perf().startTrace('saveReceipt');
    realm.write(() => {
      realm.create<IReceipt>(modelName, receipt, UpdateMode.Modified);
    });
    await trace.stop();

    const addReceiptDetails = async () => {
      await BluebirdPromise.each(
        receiptItems,
        async (receiptItem: IReceiptItem) => {
          await saveReceiptItem({
            receipt,
            receiptItem,
          });

          await restockProduct({
            product: receiptItem.product,
            quantity: receiptItem.quantity * -1,
          });
        },
      );
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
              {
                _id: receipt._id,
                coordinates: convertToLocationString(location),
              },
              UpdateMode.Modified,
            );
          });
        });

      await BluebirdPromise.each(payments, async (payment: any) => {
        await savePayment({
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
        await saveCredit({
          dueDate,
          creditAmount,
          //@ts-ignore
          customer: receiptCustomer,
          receipt,
        });
      }

      await fullTrace.stop();
    };

    addReceiptDetails().then(() => {});

    return receipt;
  };

  const updateReceiptRecord = async ({
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

    const trace = await perf().startTrace('updateReceipt');
    realm.write(() => {
      realm.create(modelName, updatedReceipt, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const updateReceipt = async ({
    customer,
    receipt,
  }: updateReceiptInterface): Promise<void> => {
    if (!receipt.customer) {
      getAnalyticsService()
        .logEvent('customerAddedToReceipt', {})
        .then(() => {});
    }

    const updates = {
      customer,
      _id: receipt._id,
      _partition: receipt._partition,
    };

    await updateReceiptRecord({
      receipt,
      updates,
    });

    await BluebirdPromise.each(receipt.payments || [], async (payment: any) => {
      await updatePayment({payment, updates: {customer}});
    });

    if (
      receipt.credit_amount > 0 &&
      receipt.credits &&
      receipt.credits.length
    ) {
      await updateCredit({credit: receipt.credits[0], updates: {customer}});
    }
  };

  const cancelReceipt = async ({
    receipt,
    cancellation_reason,
  }: cancelReceiptInterface): Promise<void> => {
    const revertProduct = async () => {
      const updates = {
        _id: receipt._id,
        _partition: receipt._partition,
        total_amount: 0,
        credit_amount: 0,
        is_cancelled: true,
        cancellation_reason,
      };

      await updateReceiptRecord({
        receipt,
        updates,
      });
    };

    const revertStockAndItems = async () => {
      await BluebirdPromise.each(receipt.items || [], async (item) => {
        await restockProduct({
          product: item.product,
          quantity: item.quantity,
        });

        await deleteReceiptItem({receiptItem: item});
      });
    };

    const revertPayment = async () => {
      await BluebirdPromise.each(receipt.payments || [], async (payment) => {
        await deletePayment({payment});
      });
    };

    const revertCredit = async () => {
      if (receipt.credits && receipt.credits.length) {
        const credit = receipt.credits[0];
        await deleteCredit({credit});

        await BluebirdPromise.each(
          credit.payments || [],
          async (creditPayment) => {
            await deleteCreditPayment({creditPayment});
          },
        );
      }
    };

    await revertProduct();
    await revertStockAndItems();
    await revertPayment();
    await revertCredit();
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

  const getReceiptAmounts = (receiptData?: IReceipt) => {
    const allPayments = receiptData
      ? getAllPayments({receipt: receiptData})
      : [];
    const totalAmountPaid: number = allPayments.reduce(
      (total, payment) => total + payment.amount_paid,
      0,
    );
    const creditAmountLeft = receiptData?.credits?.reduce(
      (acc, item) => acc + item.amount_left,
      0,
    );
    return {totalAmountPaid, creditAmountLeft};
  };

  return {
    getReceipts,
    saveReceipt,
    updateReceipt,
    cancelReceipt,
    getAllPayments,
    getReceipt,
    getReceiptsTotalAmount,
    getReceiptsTotalProductQuantity,
    getReceiptAmounts,
  };
};
