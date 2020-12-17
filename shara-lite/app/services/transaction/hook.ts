import BluebirdPromise from 'bluebird';
import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {useCreditPayment} from '@/services/credit-payment';
import {useCredit} from '@/services/credit';
import {omit} from 'lodash';
import {getAnalyticsService} from '@/services';

interface youGaveInterface {
  customer: ICustomer;
  amount: number;
  note?: string;
  dueDate?: Date;
}

interface youGotInterface {
  customer?: ICustomer;
  amount: number;
  note?: string;
}

interface addCustomerToTransactionInterface {
  transaction: IReceipt;
  customer: ICustomer;
}

interface updateDueDateInterface {
  due_date: Date;
  customer: Partial<ICustomer & Realm.Object>;
}

interface useTransactionInterface {
  getTransactions: () => IReceipt[];
  youGave: (data: youGaveInterface) => Promise<IReceipt>;
  youGot: (data: youGotInterface) => Promise<IReceipt>;
  addCustomerToTransaction: (
    data: addCustomerToTransactionInterface,
  ) => Promise<void>;
  updateDueDate: (data: updateDueDateInterface) => Promise<void>;
}

export const useTransaction = (): useTransactionInterface => {
  const {getReceipts, saveReceipt, updateReceipt} = useReceipt();
  const {saveCreditPayment} = useCreditPayment();
  const {updateCredit} = useCredit();

  const getTransactions = getReceipts;

  const youGave = async ({
    customer,
    note,
    amount,
    dueDate,
  }: youGaveInterface): Promise<IReceipt> => {
    const receiptData = {
      customer,
      note,
      dueDate,
      amountPaid: 0,
      totalAmount: amount,
      creditAmount: amount,
      tax: 0,
      payments: [],
      receiptItems: [],
    };
    getAnalyticsService()
      .logEvent('userGaveTransaction', {amount})
      .then(() => {});
    return await saveReceipt(receiptData);
  };

  const youGot = async ({
    customer,
    note,
    amount,
  }: youGotInterface): Promise<IReceipt> => {
    const receiptData = {
      customer: customer || ({} as ICustomer),
      note,
      amountPaid: amount,
      totalAmount: amount,
      creditAmount: 0,
      tax: 0,
      payments: [],
      receiptItems: [],
      is_hidden_in_pro: true,
    };

    const createdReceipt = await saveReceipt(receiptData);

    if (customer) {
      await saveCreditPayment({
        customer,
        note,
        amount,
        method: '',
      });
    }
    getAnalyticsService()
      .logEvent('userGotTransaction', {amount})
      .then(() => {});
    return createdReceipt;
  };

  const addCustomerToTransaction = async ({
    transaction,
    customer,
  }: addCustomerToTransactionInterface) => {
    const receipt = {
      ...omit(transaction),
      is_hidden_in_pro: false,
    };

    await updateReceipt({
      receipt,
      customer,
    });

    await saveCreditPayment({
      customer,
      note: transaction.note,
      amount: transaction.amount_paid,
      method: '',
    });
  };

  const updateDueDate = async ({
    due_date,
    customer,
  }: updateDueDateInterface) => {
    const credits = customer.credits?.filtered(
      'is_deleted != true AND fulfilled = false',
    );

    const updates = {
      due_date,
    };
    BluebirdPromise.each(credits || [], async (credit) => {
      await updateCredit({
        credit,
        updates,
      });
    });
  };

  return {
    getTransactions,
    youGave,
    youGot,
    addCustomerToTransaction,
    updateDueDate,
  };
};
