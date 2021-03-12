import {useRealm} from '@/services/realm';
import {IBNPLDrawdown, modelName} from '@/models/BNPLDrawdown';
import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import perf from '@react-native-firebase/perf';

interface saveBNPLDrawdownInterface {
  bnplDrawdown: IBNPLDrawdown;
}
interface useBNPLDrawdownInterface {
  getBNPLDrawdowns: () => Realm.Results<IBNPLDrawdown & Realm.Object>;
  saveBNPLDrawdown: (
    data: saveBNPLDrawdownInterface,
  ) => Promise<IBNPLDrawdown>;
}

export const useBNPLDrawdown = (): useBNPLDrawdownInterface => {
  const realm = useRealm();
  const getBNPLDrawdowns = (): Realm.Results<IBNPLDrawdown & Realm.Object> => {
    return realm
      .objects<IBNPLDrawdown>(modelName)
      .filtered('is_deleted != true');
  };

  const saveBNPLDrawdown = async ({
    bnplDrawdown,
  }: saveBNPLDrawdownInterface): Promise<IBNPLDrawdown> => {
    const updatedBNPLDrawdown: IBNPLDrawdown = {
      ...bnplDrawdown,
      _id: new ObjectId(bnplDrawdown._id),
      customer: new ObjectId(bnplDrawdown.customer?._id),
      receipt: new ObjectId(bnplDrawdown.receipt?._id),
    };

    const trace = await perf().startTrace('saveBNPLDrawdown');
    realm.write(() => {
      realm.create<IBNPLDrawdown>(
        modelName,
        updatedBNPLDrawdown,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    return updatedBNPLDrawdown;
  };


  return {
    getBNPLDrawdowns,
    saveBNPLDrawdown,
  };
};
