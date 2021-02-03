import {I18nManager} from 'react-native';
import I18n from 'i18n-js';
import {IRemoteConfigService} from '@/services/remote-config';
import {IAuthService} from '@/services/auth';
import defaultTranslations from './translations';

export interface II18nService {
  initialize(): void;
  getCurrentLocale(): string;
  setCurrentLocale(code: string): void;
  getLocales(): CountryLocale;
  isRTL(): boolean;
  strings(name: string, params?: {[key: string]: any}): string;
}

export class I18nService implements II18nService {
  private locales: CountryLocale = {
    default: 'en',
    options: [{code: 'en', name: 'English'}],
  };
  constructor(
    private remoteConfigService: IRemoteConfigService,
    private authService: IAuthService,
  ) {
    I18n.fallbacks = true;
    I18n.translations = defaultTranslations;
    I18n.defaultLocale = this.locales.default;
    I18n.locale = this.locales.default;
    I18nManager.allowRTL(this.isRTL());
  }

  initialize() {
    const user = this.authService.getUser();
    if (!user) {
      return;
    }
    const translations: string = this.remoteConfigService
      .getValue('translations')
      .asString();
    const countries: string = this.remoteConfigService
      .getValue('countries')
      .asString();
    try {
      I18n.translations = JSON.parse(translations);
      this.locales = JSON.parse(countries)[user.currency_code];
      I18n.defaultLocale = this.locales.default;
      I18n.locale = this.locales.default;
      I18nManager.allowRTL(this.isRTL());
    } catch (e) {}
  }

  strings(name: string, params: {[key: string]: any} = {}): string {
    params = Object.keys(params).reduce((acc, key) => {
      return {
        ...acc,
        [key]:
          typeof params[key] === 'string' ? params[key].trim() : params[key],
      };
    }, {});
    return I18n.t(name, params).replace(/\\n/g, '\n');
  }

  getCurrentLocale() {
    return I18n.currentLocale();
  }

  setCurrentLocale(code = this.locales.default) {
    I18n.locale = code;
  }

  getLocales() {
    return this.locales;
  }

  // Is it a RTL language?
  isRTL(): boolean {
    return (
      this.getCurrentLocale().indexOf('he') === 0 ||
      this.getCurrentLocale().indexOf('ar') === 0
    );
  }
}
