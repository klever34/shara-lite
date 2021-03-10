import {useRealm} from '@/services/realm';
import {IBNPLRepayment, modelName} from '@/models/BNPLRepayment';

interface useBNPLRepaymentInterface {
  getBNPLRepayments: () => Realm.Results<IBNPLRepayment & Realm.Object>;
}

export const useBNPLRepayment = (): useBNPLRepaymentInterface => {
  const realm = useRealm();
  const getBNPLRepayments = (): Realm.Results<IBNPLRepayment & Realm.Object> => {
    return realm
      .objects<IBNPLRepayment>(modelName)
      .filtered('is_deleted != true');
  };

  return {
    getBNPLRepayments,
  };
};
