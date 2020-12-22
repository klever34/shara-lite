import {omit} from 'lodash';
import {ObjectId} from 'bson';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {getAnalyticsService, getAuthService} from '@/services';
import {Customer} from 'types/app';
import {useCustomer} from '@/services/customer/hook';
import BluebirdPromise from 'bluebird';
import {usePaymentReminder} from '@/services/payment-reminder';

interface saveTransactionInterface {
  customer?: ICustomer | Customer;
  amount_paid: number;
  credit_amount: number;
  total_amount: number;
  note?: string;
  is_collection?: boolean;
  dueDate?: Date;
}

interface addCustomerToTransactionInterface {
  transaction: IReceipt;
  customer: ICustomer;
}

interface updateTransactionInterface {
  updates: Partial<IReceipt & Realm.Object>;
  transaction: IReceipt;
}

interface deleteTransactionInterface {
  transaction: IReceipt;
}

interface updateDueDateInterface {
  due_date: Date;
  customer: ICustomer;
}

interface useTransactionInterface {
  getTransactions: () => IReceipt[];
  getTransaction: (id: ObjectId) => IReceipt;
  saveTransaction: (data: saveTransactionInterface) => Promise<IReceipt>;
  updateTransaction: (data: updateTransactionInterface) => Promise<void>;
  deleteTransaction: (data: deleteTransactionInterface) => Promise<void>;
  addCustomerToTransaction: (
    data: addCustomerToTransactionInterface,
  ) => Promise<void>;
  updateDueDate: (data: updateDueDateInterface) => Promise<void>;
}

export const useTransaction = (): useTransactionInterface => {
  const {
    getReceipt,
    getReceipts,
    saveReceipt,
    updateReceipt,
    updateReceiptRecord,
  } = useReceipt();
  const {updateCustomer} = useCustomer();
  const {updatePaymentReminder} = usePaymentReminder();
  const user = getAuthService().getUser();

  const getTransactions = getReceipts;

  const getTransaction = (id: ObjectId) => getReceipt({receiptId: id});

  const saveTransaction = async ({
    customer,
    note,
    amount_paid,
    credit_amount,
    total_amount,
    dueDate,
    is_collection,
  }: saveTransactionInterface): Promise<IReceipt> => {
    const receiptData = {
      customer,
      note,
      dueDate,
      is_collection,
      amountPaid: amount_paid,
      totalAmount: total_amount,
      creditAmount: credit_amount,
      tax: 0,
      payments: [],
      receiptItems: [],
    };

    getAnalyticsService()
      .logEvent('userSavedTransaction', {
        amountPaid: receiptData.amountPaid,
        creditAmount: receiptData.creditAmount,
        totalAmount: receiptData.totalAmount,
        currency_code: user?.country_code ?? '',
      })
      .then(() => {});
    if (note) {
      getAnalyticsService()
        .logEvent('detailsEnteredToTransaction', {
          note,
        })
        .then(() => {});
    }
    return await saveReceipt(receiptData);
  };

  const addCustomerToTransaction = async ({
    transaction,
    customer,
  }: addCustomerToTransactionInterface) => {
    const receipt = omit(transaction);
    getAnalyticsService()
      .logEvent('customerAddedToTransaction', {})
      .then(() => {});

    await updateReceipt({
      receipt,
      customer,
    });
  };

  const updateDueDate = async ({
    due_date,
    customer,
  }: updateDueDateInterface) => {
    const updates = {due_date};
    await updateCustomer({
      updates,
      customer,
    });

    await BluebirdPromise.map(
      customer.paymentReminders || [],
      async (paymentReminder) => {
        await updatePaymentReminder({paymentReminder, updates: {}});
      },
    );

    getAnalyticsService()
      .logEvent('setCollectionDate', {})
      .then(() => {});
  };

  const updateTransaction = async ({
    updates,
    transaction,
  }: updateTransactionInterface) => {
    await updateReceiptRecord({
      updates,
      receipt: transaction,
    });
    getAnalyticsService()
      .logEvent('userUpdatedTransaction', {})
      .then(() => {});
  };

  const deleteTransaction = async ({
    transaction,
  }: deleteTransactionInterface) => {
    await updateReceiptRecord({
      updates: {
        is_deleted: true,
      },
      receipt: transaction,
    });
    getAnalyticsService()
      .logEvent('userDeletedTransaction', {})
      .then(() => {});
  };

  return {
    getTransactions,
    getTransaction,
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    addCustomerToTransaction,
    updateDueDate,
  };
};
