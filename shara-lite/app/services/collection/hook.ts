import {useRealm} from '@/services/realm';
import {ICollection, modelName} from '@/models/Collection';

interface useCollectionInterface {
  getCollections: () => Realm.Results<ICollection & Realm.Object>;
}

export const useCollection = (): useCollectionInterface => {
  const realm = useRealm();
  const getCollections = (): Realm.Results<ICollection & Realm.Object> => {
    return realm.objects<ICollection>(modelName).filtered('is_deleted != true');
  };

  return {
    getCollections,
  };
};
