import {useRealm} from '@/services/realm';
import {IDisbursementMethod, modelName} from '@/models/DisbursementMethod';
import {ObjectId} from 'bson';
import perf from '@react-native-firebase/perf';
import {UpdateMode} from 'realm';

interface useDisbursementMethodInterface {
  getDisbursementMethods: () => Realm.Results<
    IDisbursementMethod & Realm.Object
  >;
  getPrimaryDisbursementMethod: () =>
    | (IDisbursementMethod & Realm.Object)
    | null;
  saveDisbursementMethod: (
    data: saveDisbursementMethodInterface,
  ) => Promise<IDisbursementMethod>;
}

interface saveDisbursementMethodInterface {
  disbursementMethod: IDisbursementMethod;
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

  const saveDisbursementMethod = async ({
    disbursementMethod,
  }: saveDisbursementMethodInterface): Promise<IDisbursementMethod> => {
    const updatedDisbursementMethod: IDisbursementMethod = {
      ...disbursementMethod,
      _id: new ObjectId(disbursementMethod._id),
    };

    const trace = await perf().startTrace('saveDisbursementMethod');
    realm.write(() => {
      realm.create<IDisbursementMethod>(
        modelName,
        updatedDisbursementMethod,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    return updatedDisbursementMethod;
  };

  return {
    getDisbursementMethods,
    saveDisbursementMethod,
    getPrimaryDisbursementMethod,
  };
};
