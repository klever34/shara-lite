import {I18nManager} from 'react-native';
import I18n from 'i18n-js';
import {IRemoteConfigService} from '@/services/remote-config';
import defaultTranslations from './translations';
import {IStorageService} from '@/services/storage';
import {User} from 'types/app';

export interface II18nService {
  initialize(user: User): Promise<void>;
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
    private storageService: IStorageService,
  ) {
    I18n.fallbacks = true;
    I18n.translations = defaultTranslations;
    this.setCurrentLocale(undefined, false);
  }
  async initialize(user: User): Promise<void> {
    const translations: string = this.remoteConfigService
      .getValue('translations')
      .asString();
    const countries: string = this.remoteConfigService
      .getValue('countries')
      .asString();
    try {
      I18n.translations = JSON.parse(translations);
      this.locales = JSON.parse(countries)[user.currency_code] ?? this.locales;
      const savedCurrentLocale = await this.storageService.getItem<string>(
        '@shara/i18n/current_locale',
      );
      if (
        this.locales.options.findIndex(
          ({code}) => savedCurrentLocale === code,
        ) !== -1
      ) {
        this.setCurrentLocale(savedCurrentLocale ?? undefined);
      } else {
        this.setCurrentLocale();
      }
    } catch (e) {}
    return Promise.resolve();
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

  setCurrentLocale(code = this.locales.default, persist = true) {
    I18n.defaultLocale = this.locales.default;
    I18n.locale = code;
    I18nManager.allowRTL(this.isRTL());
    if (persist) {
      this.storageService.setItem('@shara/i18n/current_locale', code);
    }
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
