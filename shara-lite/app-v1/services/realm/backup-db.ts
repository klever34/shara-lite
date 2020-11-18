import {PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Realm from 'realm';
import {getApiService} from 'app-v1/services';
import {getRealmObjectCopy} from 'app-v1/services/realm/utils';

export const runDbBackup = async ({
  realm,
}: {
  realm: Realm;
}): Promise<Boolean> => {
  const apiService = getApiService();

  const schema = realm.schema;
  const data = schema.map((objSchema) => {
    const allObjects = realm.objects(objSchema.name);
    return {
      model: objSchema.name,
      data: allObjects.map((obj) =>
        getRealmObjectCopy({obj, objSchema, extractObjectId: true}),
      ),
    };
  });

  const jsonData = JSON.stringify(data, null, 2);
  const fileSavedSuccessfully = await saveToFile({jsonData});
  if (!fileSavedSuccessfully) {
    return false;
  }

  await apiService.backupData({data, type: 'db'});
  return true;
};

export const saveToFile = async ({
  jsonData,
}: {
  jsonData: string;
}): Promise<Boolean> => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );

  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    return false;
  }

  const dirs = RNFetchBlob.fs.dirs;
  const path = `${dirs.DownloadDir}/Realm db backup.json`;
  const mime = 'application/json';

  await RNFetchBlob.fs.writeFile(path, jsonData, 'utf8');
  await RNFetchBlob.fs.scanFile([{path, mime}]);
  await RNFetchBlob.android.addCompleteDownload({
    title: 'Local backup complete',
    description: 'desc',
    mime: 'application/pdf',
    path,
    showNotification: true,
  });

  return true;
};
