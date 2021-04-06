import {useRealm} from '@/services/realm'
import {IDisbursement, modelName} from '@/models/Disbursement'
import {UpdateMode} from 'realm'
import perf from '@react-native-firebase/perf'
import {ObjectId} from 'bson'

interface useDisbursementInterface {
  getDisbursements: () => Realm.Results<IDisbursement & Realm.Object>
  saveDisbursement: (data: saveDisbursementInterface) => Promise<IDisbursement>
}

interface saveDisbursementInterface {
  disbursement: IDisbursement
}

export const useDisbursement = (): useDisbursementInterface => {
  const realm = useRealm()
  const getDisbursements = (): Realm.Results<IDisbursement & Realm.Object> => {
    return realm
      .objects<IDisbursement>(modelName)
      .filtered('is_deleted != true')
  }

  const saveDisbursement = async ({
    disbursement,
  }: saveDisbursementInterface): Promise<IDisbursement> => {
    const updatedCollection: IDisbursement = {
      ...disbursement,
      _id: new ObjectId(disbursement._id),
    }

    const trace = await perf().startTrace('saveDisbursement')
    realm.write(() => {
      realm.create<IDisbursement>(
        modelName,
        updatedCollection,
        UpdateMode.Modified,
      )
    })
    await trace.stop()

    return updatedCollection
  }

  return {
    getDisbursements,
    saveDisbursement,
  }
}
