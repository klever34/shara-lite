import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';
import defaultTranslations from '@/services/i18n/translations';

export const remoteConfigDefaults: RemoteConfig = {
  translations: defaultTranslations,
  countries: {},
  minimumVersion: '0.0.0',
};

// console.log(
//   (() => {
//     return JSON.stringify(translations);
//   })(),
// );
//
// console.log(
//   (() => {
//     const generate = (object: {[key: string]: any}, prefix = '') => {
//       let file = '';
//       Object.keys(object).forEach((name) => {
//         const key = `${prefix}${prefix ? '.' : ''}${name}`;
//         const value = object[name];
//         if (typeof value === 'string') {
//           file += `${key},`;
//           file += `"${value}"\n`;
//         } else if (typeof value === 'object') {
//           file += generate(value, key);
//         }
//       });
//       return file;
//     };
//     let file = 'Key,';
//     Object.keys(translations).forEach((langCode) => {
//       file += langCode;
//     });
//     file += '\n';
//     return file + generate(translations.en);
//   })(),
// );

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
