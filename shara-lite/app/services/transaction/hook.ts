import BluebirdPromise from 'bluebird';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {useCredit} from '@/services/credit';
import {omit} from 'lodash';
import {getAnalyticsService, getAuthService} from '@/services';

interface saveTransactionInterface {
  customer: ICustomer;
  collectedAmount: number;
  outstandingAmount: number;
  note?: string;
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

interface updateDueDateInterface {
  due_date: Date;
  transaction: Partial<IReceipt & Realm.Object>;
}

interface useTransactionInterface {
  getTransactions: () => IReceipt[];
  saveTransaction: (data: saveTransactionInterface) => Promise<IReceipt>;
  updateTransaction: (data: updateTransactionInterface) => Promise<void>;
  addCustomerToTransaction: (
    data: addCustomerToTransactionInterface,
  ) => Promise<void>;
  updateDueDate: (data: updateDueDateInterface) => Promise<void>;
}

export const useTransaction = (): useTransactionInterface => {
  const {
    getReceipts,
    saveReceipt,
    updateReceipt,
    updateReceiptRecord,
  } = useReceipt();
  const {updateCredit} = useCredit();
  const user = getAuthService().getUser();

  const getTransactions = getReceipts;

  const saveTransaction = async ({
    customer,
    note,
    collectedAmount,
    outstandingAmount,
    dueDate,
  }: saveTransactionInterface): Promise<IReceipt> => {
    const receiptData = {
      customer,
      note,
      dueDate,
      amountPaid: collectedAmount,
      totalAmount: collectedAmount + outstandingAmount,
      creditAmount: outstandingAmount,
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

    await updateReceipt({
      receipt,
      customer,
    });
  };

  const updateDueDate = async ({
    due_date,
    transaction,
  }: updateDueDateInterface) => {
    const updates = {
      due_date,
    };
    BluebirdPromise.each(transaction.credits || [], async (credit) => {
      await updateCredit({
        credit,
        updates,
      });
    });
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
      .logEvent('setCollectionDate', {})
      .then(() => {});
  };

  return {
    getTransactions,
    saveTransaction,
    updateTransaction,
    addCustomerToTransaction,
    updateDueDate,
  };
};
