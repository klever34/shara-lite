import {useRealm} from '@/services/realm';
import {IBNPLDrawdown, modelName} from '@/models/BNPLDrawdown';

interface useBNPLDrawdownInterface {
  getBNPLDrawdowns: () => Realm.Results<IBNPLDrawdown & Realm.Object>;
}

export const useBNPLDrawdown = (): useBNPLDrawdownInterface => {
  const realm = useRealm();
  const getBNPLDrawdowns = (): Realm.Results<IBNPLDrawdown & Realm.Object> => {
    return realm
      .objects<IBNPLDrawdown>(modelName)
      .filtered('is_deleted != true');
  };

  return {
    getBNPLDrawdowns,
  };
};
