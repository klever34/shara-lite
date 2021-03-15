import {useRealm} from '@/services/realm';
import {IBNPLRepayment, modelName} from '@/models/BNPLRepayment';
import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import perf from '@react-native-firebase/perf';

interface saveBNPLRepaymentInterface {
  bnplRepayment: IBNPLRepayment;
}

interface useBNPLRepaymentInterface {
  getBNPLRepayments: () => Realm.Results<IBNPLRepayment & Realm.Object>;
  saveBNPLRepayment: (
    data: saveBNPLRepaymentInterface,
  ) => Promise<IBNPLRepayment>;
}

export const useBNPLRepayment = (): useBNPLRepaymentInterface => {
  const realm = useRealm();
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
      _id: new ObjectId( bnplRepayment._id ),
      bnpl_drawdown: new ObjectId(bnplRepayment.bnpl_drawdown?._id),
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


  return {
    getBNPLRepayments,
    saveBNPLRepayment,
  };
};
