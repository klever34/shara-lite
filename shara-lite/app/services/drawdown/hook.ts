import {useRealm} from '@/services/realm';
import {IDrawdown, modelName} from '@/models/Drawdown';

interface useDrawdownInterface {
  getDrawdowns: () => Realm.Results<IDrawdown & Realm.Object>;
}

export const useDrawdown = (): useDrawdownInterface => {
  const realm = useRealm();
  const getDrawdowns = (): Realm.Results<IDrawdown & Realm.Object> => {
    return realm.objects<IDrawdown>(modelName).filtered('is_deleted != true');
  };
  return {
    getDrawdowns,
  };
};
