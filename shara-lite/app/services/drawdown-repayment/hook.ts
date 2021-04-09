import {useRealm} from '@/services/realm';
import {IDrawdownRepayment, modelName} from '@/models/DrawdownRepayment';

interface useDrawdownRepaymentInterface {
  getDrawdownRepayments: () => Realm.Results<IDrawdownRepayment & Realm.Object>;
}

export const useDrawdownRepayment = (): useDrawdownRepaymentInterface => {
  const realm = useRealm();
  const getDrawdownRepayments = (): Realm.Results<IDrawdownRepayment & Realm.Object> => {
    return realm
      .objects<IDrawdownRepayment>(modelName)
      .filtered('is_deleted != true');
  };

  return {
    getDrawdownRepayments,
  };
};
