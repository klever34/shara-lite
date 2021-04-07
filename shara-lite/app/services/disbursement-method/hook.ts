import {useRealm} from '@/services/realm'
import {IDisbursementMethod, modelName} from '@/models/DisbursementMethod'
import {ObjectId} from 'bson'
import perf from '@react-native-firebase/perf'
import {UpdateMode} from 'realm'

interface useDisbursementMethodInterface {
  getDisbursementMethods: () => Realm.Results<
    IDisbursementMethod & Realm.Object
  >
  getPrimaryDisbursementMethod: () =>
    | (IDisbursementMethod & Realm.Object)
    | null
  saveDisbursementMethod: (
    data: saveDisbursementMethodInterface,
  ) => Promise<IDisbursementMethod>

  updateDisbursementMethod: (
    data: updateDisbursementMethodInterface,
  ) => Promise<void>

  deleteDisbursementMethod: (
    data: deleteDisbursementMethodInterface,
  ) => Promise<void>

  getDisbursementMethod: (
    data: getDisbursementMethodInterface,
  ) => IDisbursementMethod
}

interface saveDisbursementMethodInterface {
  disbursementMethod: IDisbursementMethod
}

interface updateDisbursementMethodInterface {
  disbursementMethod: IDisbursementMethod
  updates: Partial<IDisbursementMethod>
}

interface deleteDisbursementMethodInterface {
  disbursementMethod: IDisbursementMethod
}

interface getDisbursementMethodInterface {
  disbursementMethodId: ObjectId
}

export const useDisbursementMethod = (): useDisbursementMethodInterface => {
  const realm = useRealm()
  const getDisbursementMethods = (): Realm.Results<IDisbursementMethod &
    Realm.Object> => {
    return realm
      .objects<IDisbursementMethod>(modelName)
      .filtered('is_deleted != true')
  }

  const getDisbursementMethod = ({
    disbursementMethodId,
  }: getDisbursementMethodInterface) => {
    // @ts-ignore
    return realm.objectForPrimaryKey(
      modelName,
      disbursementMethodId,
    ) as IDisbursementMethod
  }

  const getPrimaryDisbursementMethod = ():
    | (IDisbursementMethod & Realm.Object)
    | null => {
    return realm
      .objects<IDisbursementMethod>(modelName)
      .filtered('is_deleted != true AND is_primary == true')[0]
  }

  const saveDisbursementMethod = async ({
    disbursementMethod,
  }: saveDisbursementMethodInterface): Promise<IDisbursementMethod> => {
    const updatedDisbursementMethod: IDisbursementMethod = {
      ...disbursementMethod,
      _id: new ObjectId(disbursementMethod._id),
    }

    const trace = await perf().startTrace('saveDisbursementMethod')
    realm.write(() => {
      realm.create<IDisbursementMethod>(
        modelName,
        updatedDisbursementMethod,
        UpdateMode.Modified,
      )
    })
    await trace.stop()

    return updatedDisbursementMethod
  }

  const updateDisbursementMethod = async ({
    disbursementMethod,
    updates,
  }: updateDisbursementMethodInterface) => {
    const updatedDisbursementMethod = {
      _id: disbursementMethod._id,
      ...updates,
      updated_at: new Date(),
    }

    const trace = await perf().startTrace('updatedDisbursementMethod')
    realm.write(() => {
      realm.create(modelName, updatedDisbursementMethod, UpdateMode.Modified)
    })
    await trace.stop()
  }

  const deleteDisbursementMethod = async ({
    disbursementMethod,
  }: deleteDisbursementMethodInterface) => {
    await updateDisbursementMethod({
      disbursementMethod,
      updates: {is_deleted: true},
    })
  }

  return {
    getDisbursementMethods,
    saveDisbursementMethod,
    updateDisbursementMethod,
    deleteDisbursementMethod,
    getPrimaryDisbursementMethod,
    getDisbursementMethod,
  }
}
