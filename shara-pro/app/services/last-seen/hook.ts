import {UpdateMode} from 'realm';
import omit from 'lodash/omit';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {ILastSeen, modelName} from '@/models/LastSeen';

interface useLastSeenInterface {
  updateLastSeen: () => void;
}

export const useLastSeen = (): useLastSeenInterface => {
  const realm = useRealm();
  const updateLastSeen = (): void => {
    const savedLastSeen = realm.objects<ILastSeen>(modelName);
    const lastSeen = savedLastSeen.length ? savedLastSeen[0] : {};

    const updatedLastSeen: ILastSeen = {
      ...getBaseModelValues(),
      ...omit(lastSeen),
      date: new Date(),
    };

    realm.write(() => {
      realm.create<ILastSeen>(modelName, updatedLastSeen, UpdateMode.Modified);
    });
  };

  return {
    updateLastSeen,
  };
};
