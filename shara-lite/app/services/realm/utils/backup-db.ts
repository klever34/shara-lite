import {PermissionsAndroid, Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import Realm from 'realm';
import {getApiService} from '@/services';
import {getRealmObjectCopy} from '@/services/realm/utils/copy-realm';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

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
  if(Platform.OS === 'android'){
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
  
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }
  else {
    check(PERMISSIONS.IOS.CONTACTS)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('This feature is not available (on this device / in this context)');
          break;
        case RESULTS.DENIED:
          console.log('The permission has not been requested / is denied but requestable');
          break;
        case RESULTS.LIMITED:
          console.log('The permission is limited: some actions are possible');
          break;
        case RESULTS.GRANTED:
          console.log('The permission is granted');
          break;
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore');
          break;
      }
    })
    .catch((error) => {
      // …
    });
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
