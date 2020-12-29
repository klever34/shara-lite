import Realm from 'realm';
import {shouldUpdateRealmObject} from '@/services/realm/utils';
import {addItemToQueue} from '@/services/realm/utils/queue';
import {BaseModelInterface} from '@/models/baseSchema';
import {saveLastLocalSync} from '@/services/realm/utils/sync-storage';

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
          _id: copy._id,
        }).then(() => {});
      }
    } catch (e) {
      console.log('Error writing to realm sync', e);
    }
  };

  if (!useQueue) {
    copyItem();
    return;
  }

  const updateRealmObject = shouldUpdateRealmObject({
    sourceObject: obj,
    targetRealm,
    modelName: objSchema.name,
  });

  if (!updateRealmObject) {
    return;
  }

  addItemToQueue(copyItem);
};

export const getRealmObjectCopy = ({
  obj,
  objSchema,
  extractObjectId,
}: {
  obj: any;
  objSchema: any;
  extractObjectId?: boolean;
}) => {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.type !== 'linkingObjects') {
      if (extractObjectId && obj[key] && obj[key]._id) {
        // @ts-ignore
        copy[key] = obj[key]._id;
      } else {
        // @ts-ignore
        copy[key] = obj[key];
      }
    }
  }
  return copy;
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
  // const threeWeeksAgo = subWeeks(new Date(), 3);

  sourceRealmSchema.forEach((objSchema) => {
    let allObjects = sourceRealm.objects(objSchema.name);
    const syncDate =
      lastLocalSync && lastLocalSync[objSchema.name]
        ? isLocal
          ? new Date(lastLocalSync[objSchema.name])
          : ''
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
