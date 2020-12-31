import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';
import remoteConfigDefaults from './remote-config.json';
import ConfigValue = FirebaseRemoteConfigTypes.ConfigValue;

export interface IRemoteConfigService {
  initialize(): Promise<void>;
  getValue(key: string): ConfigValue;
}

export class RemoteConfigService implements IRemoteConfigService {
  async initialize(): Promise<void> {
    try {
      remoteConfig()
        .setDefaults({
          minimumVersion: remoteConfigDefaults.minimumVersion,
          locales: JSON.stringify(remoteConfigDefaults.locales),
        })
        .then(() => remoteConfig().fetchAndActivate())
        .then((fetchedRemotely) => {
          if (fetchedRemotely) {
            console.log(
              'Configs were retrieved from the backend and activated.',
            );
          } else {
            console.log(
              'No configs were fetched from the backend, and the local configs were already activated',
            );
          }
        });
    } catch (e) {}
  }

  getValue(key: string): ConfigValue {
    const configValue = remoteConfig().getValue(key);
    return configValue;
  }
}
