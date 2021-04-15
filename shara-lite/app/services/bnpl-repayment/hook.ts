import { IBNPLRepayment, modelName } from '@/models/BNPLRepayment';
import { useRealm } from '@/services/realm';
import perf from '@react-native-firebase/perf';
import BluebirdPromise from 'bluebird';
import { ObjectId } from 'bson';
import { parseISO } from 'date-fns';
import { UpdateMode } from 'realm';
import { useBNPLDrawdown } from '../bnpl-drawdown';

interface saveBNPLRepaymentInterface {
  bnplRepayment: IBNPLRepayment;
}

interface saveBNPLDrawdownRepaymentsInterface {
  bnplRepayments: IBNPLRepayment[];
}

interface useBNPLRepaymentInterface {
  getBNPLRepayments: () => Realm.Results<IBNPLRepayment & Realm.Object>;
  saveBNPLRepayment: (
    data: saveBNPLRepaymentInterface,
  ) => Promise<IBNPLRepayment>;
  saveBNPLDrawdownRepayments: (data: saveBNPLDrawdownRepaymentsInterface) => void;
}

export const useBNPLRepayment = (): useBNPLRepaymentInterface => {
  const realm = useRealm();
  const {getBNPLDrawdown} = useBNPLDrawdown()
  const getBNPLRepayments = (): Realm.Results<IBNPLRepayment & Realm.Object> => {
    return realm
      .objects<IBNPLRepayment>(modelName)
      .filtered('is_deleted != true');
  };

  const saveBNPLRepayment = async ({
    bnplRepayment,
  }: saveBNPLRepaymentInterface): Promise<IBNPLRepayment> => {
    const updatedBNPLRepayment: IBNPLRepayment = {
      ...bnplRepayment,
      _id: new ObjectId(bnplRepayment._id),
      _partition: bnplRepayment._partition?.toString(),
      created_at: parseISO(`${bnplRepayment.created_at}Z`),
      updated_at: parseISO(`${bnplRepayment.updated_at}Z`),
      //@ts-ignore
      bnpl_drawdown: getBNPLDrawdown({bnplDrawdownId: new ObjectId(bnplRepayment.bnpl_drawdown)}),
    };

    const trace = await perf().startTrace('saveBNPLRepayment');
    realm.write(() => {
      realm.create<IBNPLRepayment>(
        modelName,
        updatedBNPLRepayment,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    return updatedBNPLRepayment;
  };

  const saveBNPLDrawdownRepayments = async ({bnplRepayments}: saveBNPLDrawdownRepaymentsInterface) => {
    await BluebirdPromise.each(bnplRepayments, async (bnplRepayment) => {
      await saveBNPLRepayment({bnplRepayment});
    });
  }


  return {
    getBNPLRepayments,
    saveBNPLRepayment,
    saveBNPLDrawdownRepayments,
  };
};
