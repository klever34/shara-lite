import {useRealm} from '@/services/realm';
import {IDisbursementMethod, modelName} from '@/models/DisbursementMethod';

interface useDisbursementMethodInterface {
  getDisbursementMethods: () => Realm.Results<
    IDisbursementMethod & Realm.Object
  >;
}

export const useDisbursementMethod = (): useDisbursementMethodInterface => {
  const realm = useRealm();
  const getDisbursementMethods = (): Realm.Results<
    IDisbursementMethod & Realm.Object
  > => {
    return realm
      .objects<IDisbursementMethod>(modelName)
      .filtered('is_deleted != true');
  };

  return {
    getDisbursementMethods,
  };
};
