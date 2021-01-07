import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';
import remoteConfigDefaults from './remote-config.json';

export interface IRemoteConfigService {
  initialize(): Promise<void>;
  getValue(key: string): FirebaseRemoteConfigTypes.ConfigValue;
}

export class RemoteConfigService implements IRemoteConfigService {
  async initialize(): Promise<void> {
    return remoteConfig()
      .setDefaults({
        minimumVersion: remoteConfigDefaults.minimumVersion,
        locales: JSON.stringify(remoteConfigDefaults.locales),
      })
      .then(() => remoteConfig().fetchAndActivate())
      .then((fetchedRemotely) => {
        if (fetchedRemotely) {
          console.log('Configs were retrieved from the backend and activated.');
        } else {
          console.log(
            'No configs were fetched from the backend, and the local configs were already activated',
          );
        }
      });
  }

  getValue(key: string): FirebaseRemoteConfigTypes.ConfigValue {
    return remoteConfig().getValue(key);
  }
}
