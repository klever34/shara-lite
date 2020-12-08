import Realm from 'realm';
import {ObjectId} from 'bson';
import {getStorageService} from '@/services';

export const lastLocalSyncStorageKey = 'lastLocalSync';
export const lastModelSyncStorageKey = 'lastModelSync';

type lastModelSyncData = {
  model: string;
  _id: ObjectId;
  updated_at: Date;
};

export const getLocalLastSync = async () => {
  const storageService = getStorageService();
  return storageService.getItem(lastLocalSyncStorageKey);
};

export const getLastModelSync = async (): Promise<lastModelSyncData | null> => {
  const storageService = getStorageService();
  return storageService.getItem<lastModelSyncData>(lastModelSyncStorageKey);
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
  _id,
}: {
  model: string;
  date?: Date;
  _id?: ObjectId;
}) => {
  const storageService = getStorageService();
  let lastSync: any = await getLocalLastSync();
  lastSync[model] = date;
  await storageService.setItem(lastLocalSyncStorageKey, lastSync);
  await saveLastModelSync({model, _id, updated_at: date});
};

export const saveLastModelSync = async ({
  model,
  updated_at,
  _id,
}: {
  model: string;
  updated_at?: Date;
  _id?: ObjectId;
}) => {
  const storageService = getStorageService();
  const data = {_id, model, updated_at};
  await storageService.setItem(lastModelSyncStorageKey, data);
};
