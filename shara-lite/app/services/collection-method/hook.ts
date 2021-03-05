import {useRealm} from '@/services/realm';
import {ICollectionMethod, modelName} from '@/models/CollectionMethod';

interface useCollectionMethodInterface {
  getCollectionMethods: () => Realm.Results<ICollectionMethod & Realm.Object>;
}

export const useCollectionMethod = (): useCollectionMethodInterface => {
  const realm = useRealm();
  const getCollectionMethods = (): Realm.Results<
    ICollectionMethod & Realm.Object
  > => {
    return realm
      .objects<ICollectionMethod>(modelName)
      .filtered('is_deleted != true');
  };

  return {
    getCollectionMethods,
  };
};
