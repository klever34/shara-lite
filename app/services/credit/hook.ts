import {UpdateMode} from 'realm';
import BluebirdPromise from 'bluebird';
import {useRealm} from '@/services/realm';
import {ICustomer} from '@/models';
import {Customer} from 'types/app';
import {IReceipt} from '@/models/Receipt';
import {getBaseModelValues} from '@/helpers/models';
import {ICredit, modelName} from '@/models/Credit';
import {getAnalyticsService, getAuthService} from '@/services';
import perf from '@react-native-firebase/perf';
import {useCreditProxy} from '@/services/credit/credit-proxy-hook';

interface saveCreditInterface {
  dueDate?: Date;
  customer?: ICustomer | Customer;
  receipt?: IReceipt;
  creditAmount: number;
}

export interface updateCreditInterface {
  credit: ICredit;
  updates: object;
}

interface deleteCreditInterface {
  credit: ICredit;
}

interface useCreditInterface {
  getCredits: () => ICredit[];
  saveCredit: (data: saveCreditInterface) => Promise<void>;
  updateCredit: (data: updateCreditInterface) => Promise<void>;
  deleteCredit: (data: deleteCreditInterface) => void;
}

export const useCredit = (): useCreditInterface => {
  const realm = useRealm();
  const {deleteCreditPayment} = useCreditProxy();

  const getCredits = (): ICredit[] => {
    return (realm
      .objects<ICredit>(modelName)
      .filtered('is_deleted = false') as unknown) as ICredit[];
  };

  const saveCredit = async ({
    customer,
    receipt,
    dueDate,
    creditAmount,
  }: saveCreditInterface): Promise<void> => {
    const credit: ICredit = {
      receipt,
      due_date: dueDate,
      total_amount: creditAmount,
      amount_left: creditAmount,
      amount_paid: 0,
      ...getBaseModelValues(),
    };

    if (customer && customer.name) {
      credit.customer_name = customer?.name;
      credit.customer_mobile = customer?.mobile;
    }

    if (customer && customer._id) {
      credit.customer = customer as ICustomer;
    }

    const trace = await perf().startTrace('saveCredit');
    realm.write(() => {
      realm.create<ICredit>(modelName, credit, UpdateMode.Modified);
    });
    await trace.stop();

    getAnalyticsService()
      .logEvent('creditAdded', {
        item_id: credit?._id?.toString() ?? '',
        amount: creditAmount.toString(),
        currency_code: getAuthService().getUser()?.currency_code ?? '',
      })
      .then(() => {});
  };

  const updateCredit = async ({credit, updates}: updateCreditInterface) => {
    const updatedCredit = {
      _id: credit._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updateCredit');
    realm.write(() => {
      realm.create(modelName, updatedCredit, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deleteCredit = async ({credit}: deleteCreditInterface) => {
    await updateCredit({
      credit,
      updates: {is_deleted: true},
    });

    await BluebirdPromise.each(credit.payments || [], async (creditPayment) => {
      await deleteCreditPayment({creditPayment});
    });
  };

  return {
    getCredits,
    saveCredit,
    updateCredit,
    deleteCredit,
  };
};
