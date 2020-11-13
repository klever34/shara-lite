import Realm from 'realm';
import {getStorageService} from '@/services';

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
