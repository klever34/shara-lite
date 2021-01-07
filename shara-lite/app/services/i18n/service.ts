import ReactNative from 'react-native';
import I18n from 'react-native-i18n';
import {IRemoteConfigService} from '@/services/remote-config';

export interface II18nService {
  initialize(): void;
  isRTL(): boolean;
  strings(name: string, params?: {[key: string]: any}): string;
}

export class I18nService implements II18nService {
  private currentLocale = I18n.currentLocale();

  constructor(private remoteConfigService: IRemoteConfigService) {}

  initialize() {
    const locales = this.remoteConfigService.getValue('locales').asString();

    I18n.fallbacks = true;

    if (!locales) {
      return;
    }
    I18n.translations = JSON.parse(locales);

    ReactNative.I18nManager.allowRTL(this.isRTL());
  }

  strings(name: string, params: {[key: string]: any} = {}): string {
    return I18n.t(name, params);
  }

  // Is it a RTL language?
  isRTL(): boolean {
    return (
      this.currentLocale.indexOf('he') === 0 ||
      this.currentLocale.indexOf('ar') === 0
    );
  }
}
