import Realm from 'realm';
import {
  getRealmObjectCopy,
  shouldUpdateRealmObject,
} from '@/services/realm/utils';
import {addItemToQueue} from '@/services/realm/queue';

const copyObject = ({
  obj,
  objSchema,
  targetRealm,
  useQueue,
}: {
  obj: any;
  objSchema: any;
  targetRealm: Realm;
  useQueue: boolean;
}) => {
  const copy = getRealmObjectCopy({obj, objSchema});

  const copyItem = () => {
    const updateRealmObject = shouldUpdateRealmObject({
      sourceObject: obj,
      targetRealm,
      modelName: objSchema.name,
    });

    if (!updateRealmObject) {
      return;
    }

    try {
      targetRealm.create(objSchema.name, copy, Realm.UpdateMode.Modified);
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
  lastSyncDate,
  useQueue,
}: {
  sourceRealm: Realm;
  targetRealm: Realm;
  partitionValue: string;
  useQueue: boolean;
  lastSyncDate?: Date;
}) => {
  const sourceRealmSchema = sourceRealm.schema;
  targetRealm.write(() => {
    sourceRealmSchema.forEach((objSchema) => {
      let allObjects = sourceRealm.objects(objSchema.name);

      allObjects = lastSyncDate
        ? allObjects.filtered('updated_at >= $0', lastSyncDate)
        : allObjects;

      allObjects.sorted('updated_at', true).forEach((obj: any) => {
        if (obj._partition && obj._partition === partitionValue) {
          copyObject({obj, objSchema, targetRealm, useQueue});
        }
      });
    });
  });
};
