import {UpdateMode} from 'realm';
import perf from '@react-native-firebase/perf';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {IActivity, modelName} from '@/models/Activity';

interface saveActivityInterface {
  activity: IActivity;
}

interface useActivityInterface {
  getActivities: () => Realm.Results<IActivity>;
  saveActivity: (data: saveActivityInterface) => Promise<IActivity>;
}

export const useActivity = (): useActivityInterface => {
  const realm = useRealm();

  const getActivities = (): Realm.Results<IActivity> => {
    return realm.objects<IActivity>(modelName).filtered('is_deleted != true');
  };

  const saveActivity = async ({
    activity,
  }: saveActivityInterface): Promise<IActivity> => {
    const updatedActivity: IActivity = {
      ...getBaseModelValues(),
      ...activity,
    };

    const trace = await perf().startTrace('saveActivity');
    realm.write(() => {
      realm.create<IActivity>(modelName, updatedActivity, UpdateMode.Modified);
    });
    await trace.stop();

    return activity;
  };

  return {
    getActivities,
    saveActivity,
  };
};
