import {IDrawdown, modelName} from '@/models/Drawdown';
import {useRealm} from '@/services/realm';
import perf from '@react-native-firebase/perf';
import {ObjectId} from 'bson';
import {UpdateMode} from 'realm';

interface useDrawdownInterface {
  saveDrawdown: (
    data: saveDrawdownInterface,
  ) => Promise<IDrawdown>;
  getDrawdowns: () => Realm.Results<IDrawdown & Realm.Object>;
}

interface saveDrawdownInterface {
  drawdown: IDrawdown;
}

export const useDrawdown = (): useDrawdownInterface => {
  const realm = useRealm();

  const getDrawdowns = (): Realm.Results<IDrawdown & Realm.Object> => {
    return realm.objects<IDrawdown>(modelName).filtered('is_deleted != true');
  };

  const saveDrawdown = async ({
    drawdown,
  }: saveDrawdownInterface): Promise<IDrawdown> => {
    const updatedDrawdown: IDrawdown = {
      ...drawdown,
      _id: new ObjectId(drawdown._id),
    };

    const trace = await perf().startTrace('saveDrawdown');
    realm.write(() => {
      realm.create<IDrawdown>(modelName, updatedDrawdown, UpdateMode.Modified);
    });
    await trace.stop();

    return drawdown;
  };
  return {
    saveDrawdown,
    getDrawdowns,
  };
};
