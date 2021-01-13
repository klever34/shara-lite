import ReactNative from 'react-native';
import I18n from 'i18n-js';
import {getLocales} from 'react-native-localize';
import {IRemoteConfigService} from '@/services/remote-config';
import {IAuthService} from '@/services/auth';
import defaultTranslations from './translations';

export interface II18nService {
  initialize(): void;
  isRTL(): boolean;
  strings(name: string, params?: {[key: string]: any}): string;
}

export class I18nService implements II18nService {
  private currentLocale = I18n.currentLocale();
  private locales = getLocales();

  constructor(
    private remoteConfigService: IRemoteConfigService,
    private authService: IAuthService,
  ) {}

  initialize() {
    I18n.fallbacks = true;
    const user = this.authService.getUser();

    const translations: string = this.remoteConfigService
      .getValue('translations')
      .asString();

    const countries: string = this.remoteConfigService
      .getValue('countries')
      .asString();

    I18n.defaultLocale = 'en';
    try {
      I18n.translations = JSON.parse(translations);
      const locales: CountryLocale = JSON.parse(countries)[
        user?.country_code ?? ''
      ];
      I18n.locale = locales.default;
    } catch (e) {
      I18n.translations = defaultTranslations;
      I18n.locale = 'en';
    }

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
