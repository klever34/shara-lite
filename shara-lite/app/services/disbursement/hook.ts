import {useRealm} from '@/services/realm';
import {IDisbursement, modelName} from '@/models/Disbursement';

interface useDisbursementInterface {
  getDisbursements: () => Realm.Results<IDisbursement & Realm.Object>;
}

export const useDisbursement = (): useDisbursementInterface => {
  const realm = useRealm();
  const getDisbursements = (): Realm.Results<IDisbursement & Realm.Object> => {
    return realm
      .objects<IDisbursement>(modelName)
      .filtered('is_deleted != true');
  };

  return {
    getDisbursements,
  };
};
