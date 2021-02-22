import {useRealm} from '@/services/realm';
import {IDisbursementMethod, modelName} from '@/models/DisbursementMethod';

interface useDisbursementMethodInterface {
  getDisbursementMethods: () => Realm.Results<
    IDisbursementMethod & Realm.Object
  >;
  getPrimaryDisbursementMethod: () =>
    | (IDisbursementMethod & Realm.Object)
    | null;
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

  const getPrimaryDisbursementMethod = ():
    | (IDisbursementMethod & Realm.Object)
    | null => {
    return realm
      .objects<IDisbursementMethod>(modelName)
      .filtered('is_deleted != true AND is_primary == true')[0];
  };

  return {
    getDisbursementMethods,
    getPrimaryDisbursementMethod,
  };
};
