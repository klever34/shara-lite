import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import BluebirdPromise from 'bluebird';
import {useRealm} from '@/services/realm';
import {ICustomer} from '@/models';
import {getBaseModelValues} from '@/helpers/models';
import {ICredit} from '@/models/Credit';
import {getAnalyticsService, getAuthService} from '@/services';
import {ICreditPayment, modelName} from '@/models/CreditPayment';
import {IPayment} from '@/models/Payment';
import {useCustomer} from '@/services/customer/hook';
import {usePayment} from '@/services/payment';
import perf from '@react-native-firebase/perf';
import {useCredit} from '@/services/credit';
import {IReceipt} from '@/models/Receipt';

interface saveCreditPaymentInterface {
  customer: ICustomer;
  receipt?: IReceipt;
  amount: number;
  method: string;
  note?: string;
}

interface getPaymentsFromCreditInterface {
  credits?: ICredit[];
}

interface updateCreditPaymentInterface {
  creditPayment: ICreditPayment;
  updates: object;
}

export interface deleteCreditPaymentInterface {
  creditPayment: ICreditPayment;
}

interface useCreditPayment {
  getCreditPayments: () => ICreditPayment[];
  saveCreditPayment: (data: saveCreditPaymentInterface) => Promise<void>;
  getPaymentsFromCredit: (params: getPaymentsFromCreditInterface) => Array<any>;
  updateCreditPayment: (data: updateCreditPaymentInterface) => void;
  deleteCreditPayment: (data: deleteCreditPaymentInterface) => void;
}

export const useCreditPayment = (): useCreditPayment => {
  const realm = useRealm();
  const {getCustomer} = useCustomer();
  const {updateCredit} = useCredit();
  const {savePayment} = usePayment();

  const getCreditPayments = (): ICreditPayment[] => {
    return (realm
      .objects<ICreditPayment>(modelName)
      .filtered('is_deleted != true') as unknown) as ICreditPayment[];
  };

  const saveCreditPayment = async ({
    customer,
    receipt,
    amount,
    method,
    note,
  }: saveCreditPaymentInterface): Promise<void> => {
    const updatedCustomer = getCustomer({
      customerId: customer._id as ObjectId,
    });
    const receiptCredits = receipt && receipt.credits ? receipt.credits : [];
    const customerCredits = updatedCustomer.credits || [];
    const otherCredits = customerCredits.filter(
      (credit) =>
        !receiptCredits.find(
          (receiptCredit) => receiptCredit._id === credit._id,
        ),
    );

    const credits = [...receiptCredits, ...otherCredits];
    let amountLeft = amount;

    await BluebirdPromise.each(credits || [], async (credit) => {
      if (amountLeft <= 0 || credit.fulfilled) {
        return;
      }

      const amountLeftFromDeduction = amountLeft - credit.amount_left;

      const creditUpdates: any = {
        _id: credit._id,
      };

      if (amountLeftFromDeduction >= 0) {
        creditUpdates.amount_left = 0;
        creditUpdates.fulfilled = true;
        creditUpdates.amount_paid = credit.amount_left;
        amountLeft = amountLeftFromDeduction;
      } else {
        creditUpdates.amount_left = Math.abs(amountLeftFromDeduction);
        creditUpdates.amount_paid = amountLeft;
      }

      await updateCredit({credit, updates: creditUpdates});

      const paymentData = {
        customer,
        amount: creditUpdates.amount_paid,
        method,
        note,
        type: 'credit',
      };

      const payment = await savePayment({
        ...paymentData,
      });

      const creditPayment: ICreditPayment = {
        payment,
        credit,
        amount_paid: amount,
        ...getBaseModelValues(),
      };

      const trace = await perf().startTrace('saveCreditPayment');
      realm.write(() => {
        realm.create<ICreditPayment>(
          modelName,
          creditPayment,
          UpdateMode.Modified,
        );
      });
      await trace.stop();

      amountLeft = amountLeftFromDeduction <= 0 ? 0 : amountLeftFromDeduction;
      getAnalyticsService()
        .logEvent('creditPaid', {
          method,
          amount: amount.toString(),
          currency_code: getAuthService().getUser()?.currency_code ?? '',
          remaining_balance: amountLeft.toString(),
          item_id: credit?._id?.toString() ?? '',
        })
        .then(() => {});
    });
  };

  const getPaymentsFromCredit = ({
    credits,
  }: getPaymentsFromCreditInterface): Array<any> => {
    if (!credits || !credits.length) {
      return [];
    }

    return credits.reduce((allCredits: IPayment[], credit) => {
      const creditPayments =
        credit.payments?.map(
          (creditPayment: ICreditPayment) => creditPayment.payment,
        ) || [];

      return [...allCredits, ...creditPayments];
    }, []);
  };

  const updateCreditPayment = async ({
    creditPayment,
    updates,
  }: updateCreditPaymentInterface) => {
    const updatedCreditPayment = {
      _id: creditPayment._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updateCreditPayment');
    realm.write(() => {
      realm.create(modelName, updatedCreditPayment, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deleteCreditPayment = async ({
    creditPayment,
  }: deleteCreditPaymentInterface) => {
    await updateCreditPayment({
      creditPayment,
      updates: {is_deleted: true},
    });
  };

  return {
    getCreditPayments,
    saveCreditPayment,
    getPaymentsFromCredit,
    updateCreditPayment,
    deleteCreditPayment,
  };
};
