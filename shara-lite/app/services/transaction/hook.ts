import {ICustomer} from '@/models';
import {IReceipt} from '@/models/Receipt';
import {useReceipt} from '@/services/receipt';
import {useCreditPayment} from '@/services/credit-payment';

interface youGaveInterface {
  customer: ICustomer;
  amount: number;
  note?: string;
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

interface useTransactionInterface {
  getTransactions: () => IReceipt[];
  youGave: (data: youGaveInterface) => Promise<IReceipt>;
  youGot: (data: youGotInterface) => Promise<IReceipt>;
  addCustomerToTransaction: (data: addCustomerToTransactionInterface) => void;
}

export const useTransaction = (): useTransactionInterface => {
  const {getReceipts, saveReceipt, updateReceipt} = useReceipt();
  const {saveCreditPayment} = useCreditPayment();

  const getTransactions = getReceipts;

  const youGave = async ({
    customer,
    note,
    amount,
  }: youGaveInterface): Promise<IReceipt> => {
    const receiptData = {
      customer,
      note,
      amountPaid: 0,
      totalAmount: amount,
      creditAmount: amount,
      tax: 0,
      payments: [],
      receiptItems: [],
    };

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
      saveCreditPayment({
        customer,
        note,
        amount,
        method: '',
      }).then(() => {});
    }

    return createdReceipt;
  };

  const addCustomerToTransaction = async ({
    transaction,
    customer,
  }: addCustomerToTransactionInterface) => {
    const receipt = {
      ...transaction,
      is_hidden_in_pro: false,
    };

    await updateReceipt({
      receipt,
      customer,
    });

    saveCreditPayment({
      customer,
      note: transaction.note,
      amount: transaction.amount_paid,
      method: '',
    }).then(() => {});
  };

  return {
    getTransactions,
    youGave,
    youGot,
    addCustomerToTransaction,
  };
};
