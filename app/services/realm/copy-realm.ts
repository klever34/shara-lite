import Realm from 'realm';
import {
  getRealmObjectCopy,
  shouldUpdateRealmObject,
} from '@/services/realm/utils';

const copyObject = ({
  obj,
  objSchema,
  targetRealm,
}: {
  obj: any;
  objSchema: any;
  targetRealm: Realm;
}) => {
  const copy = getRealmObjectCopy({obj, objSchema});
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

export const copyRealm = ({
  sourceRealm,
  targetRealm,
  partitionValue,
  lastSyncDate,
}: {
  sourceRealm: Realm;
  targetRealm: Realm;
  partitionValue: string;
  lastSyncDate?: Date;
}) => {
  const sourceRealmSchema = sourceRealm.schema;
  targetRealm.write(() => {
    sourceRealmSchema.forEach((objSchema) => {
      let allObjects = sourceRealm.objects(objSchema.name);

      allObjects = lastSyncDate
        ? allObjects.filtered('updated_at >= $0', lastSyncDate)
        : allObjects;

      allObjects.forEach((obj: any) => {
        if (obj._partition && obj._partition === partitionValue) {
          copyObject({obj, objSchema, targetRealm});
        }
      });
    });
  });
};
