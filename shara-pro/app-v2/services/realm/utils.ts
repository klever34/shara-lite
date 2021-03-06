import Realm from 'realm';
import {BaseModelInterface} from 'app-v2/models/baseSchema';
import {getStorageService} from 'app-v2/services';

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

export const shouldUpdateRealmObject = ({
  sourceObject,
  targetRealm,
  modelName,
}: {
  sourceObject: any;
  targetRealm: Realm;
  modelName: string;
}): boolean => {
  if (!sourceObject.isValid()) {
    return false;
  }

  const targetRecord = targetRealm.objectForPrimaryKey(
    modelName,
    sourceObject._id,
  ) as BaseModelInterface & {isValid: () => boolean};

  if (targetRecord && !targetRecord.isValid()) {
    return false;
  }

  return (
    !targetRecord ||
    !targetRecord.updated_at ||
    new Date(sourceObject.updated_at) > new Date(targetRecord.updated_at)
  );
};

export const lastLocalSyncStorageKey = 'lastLocalSync';

export const getLocalLastSync = async () => {
  const storageService = getStorageService();
  return storageService.getItem(lastLocalSyncStorageKey);
};

export const initLocalLastSyncStorage = async ({realm}: {realm: Realm}) => {
  const storageService = getStorageService();
  let lastSync: any = await getLocalLastSync();
  if (lastSync) {
    return;
  }

  const initialSync = {};
  realm.schema.forEach((objSchema) => {
    // @ts-ignore
    initialSync[objSchema.name] = new Date();
  });

  await storageService.setItem(lastLocalSyncStorageKey, initialSync);
};

export const saveLastLocalSync = async ({
  model,
  date,
}: {
  model: string;
  date?: Date;
}) => {
  const storageService = getStorageService();
  let lastSync: any = await getLocalLastSync();
  lastSync[model] = date;
  await storageService.setItem(lastLocalSyncStorageKey, lastSync);
};
