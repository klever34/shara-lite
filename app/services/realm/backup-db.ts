import Realm from 'realm';
import RNFetchBlob from 'rn-fetch-blob';
import {omit} from 'lodash';
import {getApiService} from '@/services';

export const runDbBackup = async ({realm}: {realm: Realm}) => {
  const apiService = getApiService();

  const schema = realm.schema;
  const data = schema.map((objSchema) => {
    const allObjects = realm.objects(objSchema.name);
    return {
      model: objSchema.name,
      data: allObjects.map(omit),
    };
  });

  const jsonData = JSON.stringify(data, null, 2);
  await saveToFile({jsonData});
  await apiService.backupData({data, type: 'db'});
};

export const saveToFile = async ({jsonData}: {jsonData: string}) => {
  const dirs = RNFetchBlob.fs.dirs;
  const path = dirs.DCIMDir + '/realm-db-backup.json';
  await RNFetchBlob.fs.writeFile(path, jsonData, 'utf8');
};
