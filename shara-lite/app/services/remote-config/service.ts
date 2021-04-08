import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';
import defaultTranslations from '@/services/i18n/translations';

export const remoteConfigDefaults: RemoteConfig = {
  translations: defaultTranslations,
  countries: {},
  minimumVersion: '0.0.0',
  sharaMoneyEnabledCountries: {
    NGN: {},
    KES: {maxWithdrawalAmount: 50000},
  },
  sharaMoneyEnabledUsers: {},
};

export interface IRemoteConfigService {
  initialize(): Promise<void>;

  getValue(key: keyof RemoteConfig): FirebaseRemoteConfigTypes.ConfigValue;
}

export class RemoteConfigService implements IRemoteConfigService {
  async initialize(): Promise<void> {
    return remoteConfig()
      .setDefaults({
        minimumVersion: remoteConfigDefaults.minimumVersion,
        translations: JSON.stringify(remoteConfigDefaults.translations),
      })
      .then(() => remoteConfig().fetch(10))
      .then(() => remoteConfig().activate())
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

  getValue(key: keyof RemoteConfig): FirebaseRemoteConfigTypes.ConfigValue {
    // return {
    //   asString(): string {
    //     return JSON.stringify(remoteConfigDefaults[key]);
    //   },
    //   getSource(): 'remote' | 'default' | 'static' {
    //     return 'default';
    //   },
    //   asNumber(): number {
    //     return 0;
    //   },
    //   asBoolean(): boolean {
    //     return false;
    //   },
    // };
    return remoteConfig().getValue(key);
  }
}
