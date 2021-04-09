import {useRealm} from '@/services/realm'
import {ICollection, modelName} from '@/models/Collection'
import {UpdateMode} from 'realm'
import perf from '@react-native-firebase/perf'
import {ObjectId} from 'bson'

interface updateCollectionInterface {
  collection: ICollection
  updates: Partial<ICollection>
}
interface saveCollectionInterface {
  collection: ICollection
}

interface useCollectionInterface {
  getCollections: () => Realm.Results<ICollection & Realm.Object>
  saveCollection: (data: saveCollectionInterface) => Promise<ICollection>
  updateCollection: (data: updateCollectionInterface) => void
}

export const useCollection = (): useCollectionInterface => {
  const realm = useRealm()
  const getCollections = (): Realm.Results<ICollection & Realm.Object> => {
    return realm.objects<ICollection>(modelName).filtered('is_deleted != true')
  }

  const saveCollection = async ({
    collection,
  }: saveCollectionInterface): Promise<ICollection> => {
    const updatedCollection: ICollection = {
      ...collection,
      _id: new ObjectId(collection._id),
    }

    const trace = await perf().startTrace('saveCollection')
    realm.write(() => {
      realm.create<ICollection>(
        modelName,
        updatedCollection,
        UpdateMode.Modified,
      )
    })
    await trace.stop()

    return updatedCollection
  }

  const updateCollection = ({
    collection,
    updates,
  }: updateCollectionInterface) => {
    const updatedCollection = {
      _id: collection._id,
      ...updates,
      updated_at: new Date(),
    }

    realm.write(() => {
      realm.create(modelName, updatedCollection, UpdateMode.Modified)
    })
  }

  return {
    getCollections,
    saveCollection,
    updateCollection,
  }
}
