import Realm from 'realm';
import {
  getRealmObjectCopy,
  saveLastLocalSync,
  shouldUpdateRealmObject,
} from '@/services/realm/utils';
import {addItemToQueue} from '@/services/realm/queue';
import subWeeks from 'date-fns/subWeeks';
import {BaseModelInterface} from '@/models/baseSchema';

const copyObject = ({
  obj,
  objSchema,
  targetRealm,
  useQueue,
  isLocal,
}: {
  obj: any;
  objSchema: any;
  targetRealm: Realm;
  useQueue: boolean;
  isLocal: boolean;
}) => {
  const copy = getRealmObjectCopy({obj, objSchema}) as BaseModelInterface;
  const updateRealmObject = shouldUpdateRealmObject({
    sourceObject: obj,
    targetRealm,
    modelName: objSchema.name,
  });

  if (!updateRealmObject) {
    return;
  }

  const copyItem = () => {
    try {
      const writeItem = () => {
        targetRealm.create(objSchema.name, copy, Realm.UpdateMode.Modified);
      };
      if (targetRealm.isInTransaction) {
        writeItem();
      } else {
        targetRealm.write(writeItem);
      }

      if (isLocal && copy.updated_at) {
        saveLastLocalSync({
          model: objSchema.name,
          date: copy.updated_at,
        }).then(() => {});
      }
    } catch (e) {
      console.log('Error writing to realm sync', e);
    }
  };

  if (useQueue) {
    addItemToQueue(copyItem);
  } else {
    copyItem();
  }
};

export const copyRealm = ({
  sourceRealm,
  targetRealm,
  partitionValue,
  lastLocalSync,
  useQueue,
  isLocal,
}: {
  sourceRealm: Realm;
  targetRealm: Realm;
  partitionValue: string;
  useQueue: boolean;
  isLocal: boolean;
  lastLocalSync?: any;
}) => {
  const sourceRealmSchema = sourceRealm.schema;
  const threeWeeksAgo = subWeeks(new Date(), 3);

  sourceRealmSchema.forEach((objSchema) => {
    let allObjects = sourceRealm.objects(objSchema.name);
    const syncDate =
      lastLocalSync && lastLocalSync[objSchema.name]
        ? isLocal
          ? new Date(lastLocalSync[objSchema.name])
          : threeWeeksAgo
        : '';

    allObjects = syncDate
      ? allObjects.filtered('updated_at >= $0', syncDate)
      : allObjects;

    allObjects.sorted('updated_at').forEach((obj: any) => {
      if (obj._partition && obj._partition === partitionValue) {
        copyObject({obj, objSchema, targetRealm, useQueue, isLocal});
      }
    });
  });
};
