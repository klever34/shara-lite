import DIContainer, {object, get, IDIContainer} from 'rsdi';
import {IStorageService, StorageService} from './storage';
import {ContactService, IContactService} from './contact';
import {AuthService, IAuthService} from './auth';
import {IRealmService, RealmService} from './realm';
import {ApiService, IApiService} from './api';
import {INavigationService, NavigationService} from './navigation';
import {AnalyticsService, IAnalyticsService} from './analytics';
import {INotificationService, NotificationService} from './notification';
import {IGeolocationService, GeolocationService} from './geolocation';
import {AddressService, IAddressService} from '@/services/address/service';
import {
  IIPGeolocationService,
  IPGeolocationService,
} from '@/services/ip-geolocation';
import {
  IRemoteConfigService,
  RemoteConfigService,
} from '@/services/remote-config';
import {I18nService, II18nService} from '@/services/i18n';

const createDIContainer = (): IDIContainer => {
  const container = new DIContainer();
  container.addDefinitions({
    Notification: object(NotificationService),
    Navigation: object(NavigationService),
    Realm: object(RealmService),
    Storage: object(StorageService),
    Geolocation: object(GeolocationService),
    IPGeolocation: object(IPGeolocationService),
    Analytics: object(AnalyticsService).construct(get('Storage')),
    Auth: object(AuthService).construct(get('Storage'), get('Analytics')),
    Api: object(ApiService).construct(get('Auth'), get('Storage')),
    Contact: object(ContactService).construct(
      get('Realm'),
      get('Api'),
      get('Auth'),
      get('IPGeolocation'),
    ),
    Address: object(AddressService).construct(get('Realm')),
    RemoteConfig: object(RemoteConfigService),
    I18n: object(I18nService).construct(
      get('RemoteConfig'),
      get('Auth'),
      get('Storage'),
    ),
  });
  return container;
};

export const container = createDIContainer();

export const getNotificationService = () =>
  container.get<INotificationService>('Notification');

export const getNavigationService = () =>
  container.get<INavigationService>('Navigation');

export const getAnalyticsService = () =>
  container.get<IAnalyticsService>('Analytics');

export const getRealmService = () => container.get<IRealmService>('Realm');

export const getStorageService = () =>
  container.get<IStorageService>('Storage');

export const getAuthService = () => container.get<IAuthService>('Auth');

export const getApiService = () => container.get<IApiService>('Api');

export const getContactService = () =>
  container.get<IContactService>('Contact');

export const getGeolocationService = () =>
  container.get<IGeolocationService>('Geolocation');

export const getAddressService = () =>
  container.get<IAddressService>('Address');

export const getIPGeolocationService = () =>
  container.get<IIPGeolocationService>('IPGeolocation');

export const getRemoteConfigService = () =>
  container.get<IRemoteConfigService>('RemoteConfig');

export const getI18nService = () => container.get<II18nService>('I18n');
