import Realm from 'realm';
import RNFetchBlob from 'rn-fetch-blob';
import {getApiService} from '@/services';
import {getRealmObjectCopy} from '@/services/realm/utils';

export const runDbBackup = async ({realm}: {realm: Realm}) => {
  const apiService = getApiService();

  const schema = realm.schema;
  const data = schema.map((objSchema) => {
    const allObjects = realm.objects(objSchema.name);
    return {
      model: objSchema.name,
      data: allObjects.map((obj) => getRealmObjectCopy({obj, objSchema})),
    };
  });

  const jsonData = JSON.stringify(data, null, 2);
  await saveToFile({jsonData});
  await apiService.backupData({data, type: 'db'});
};

export const saveToFile = async ({jsonData}: {jsonData: string}) => {
  const dirs = RNFetchBlob.fs.dirs;
  const path = dirs.DocumentDir + '/realm-db-backup.json';

  console.log(path);
  await RNFetchBlob.fs.writeFile(path, jsonData, 'utf8');
};
