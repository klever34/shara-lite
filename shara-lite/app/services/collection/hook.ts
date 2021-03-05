import {useRealm} from '@/services/realm';
import {ICollection, modelName} from '@/models/Collection';
import { UpdateMode } from 'realm';

interface updateCollectionInterface {
  collection: ICollection;
  updates: Partial<ICollection>;
}

interface useCollectionInterface {
  getCollections: () => Realm.Results<ICollection & Realm.Object>;
  updateCollection: (data: updateCollectionInterface) => void;
}

export const useCollection = (): useCollectionInterface => {
  const realm = useRealm();
  const getCollections = (): Realm.Results<ICollection & Realm.Object> => {
    return realm.objects<ICollection>(modelName).filtered('is_deleted != true');
  };

  const updateCollection = ({
    collection,
    updates,
  }: updateCollectionInterface) => {
    const updatedCollection = {
      _id: collection._id,
      ...updates,
      updated_at: new Date(),
    };

    realm.write(() => {
      realm.create(modelName, updatedCollection, UpdateMode.Modified);
    });
  };

  return {
    getCollections,
    updateCollection,
  };
};
