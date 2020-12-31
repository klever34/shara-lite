import DIContainer, {object, get, IDIContainer} from 'rsdi';
import {IStorageService, StorageService} from './storage';
import {ContactService, IContactService} from './contact';
import {AuthService, IAuthService} from './auth';
import {IRealmService, RealmService} from './realm';
import {ApiService, IApiService} from './api';
import {IPubNubService, PubNubService} from './pubnub';
import {INavigationService, NavigationService} from './navigation';
import {AnalyticsService, IAnalyticsService} from './analytics';
import {IMessageService, MessageService} from '@/services/MessageService';
import {
  ConversationService,
  IConversationService,
} from '@/services/ConversationService';
import {INotificationService, NotificationService} from './notification';
import {IGeolocationService, GeolocationService} from './geolocation';
import {AddressService, IAddressService} from '@/services/address/service';
import {
  IIPGeolocationService,
  IPGeolocationService,
} from '@/services/ip-geolocation';
import {IRemoteConfigService} from '@/services/remote-config';

const createDIContainer = (): IDIContainer => {
  const container = new DIContainer();
  container.addDefinitions({
    Notification: object(NotificationService),
    Navigation: object(NavigationService),
    Analytics: object(AnalyticsService),
    PubNub: object(PubNubService),
    Realm: object(RealmService),
    Storage: object(StorageService),
    Geolocation: object(GeolocationService),
    IPGeolocation: object(IPGeolocationService),
    Auth: object(AuthService).construct(
      get('Storage'),
      get('PubNub'),
      get('Analytics'),
    ),
    Api: object(ApiService).construct(get('Auth'), get('Storage')),
    Contact: object(ContactService).construct(
      get('Realm'),
      get('Api'),
      get('Auth'),
      get('IPGeolocation'),
    ),
    Message: object(MessageService).construct(get('Realm'), get('PubNub')),
    Conversation: object(ConversationService).construct(
      get('Realm'),
      get('PubNub'),
      get('Auth'),
      get('Api'),
      get('Contact'),
    ),
    Address: object(AddressService).construct(get('Realm')),
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

export const getPubNubService = () => container.get<IPubNubService>('PubNub');

export const getRealmService = () => container.get<IRealmService>('Realm');

export const getStorageService = () =>
  container.get<IStorageService>('Storage');

export const getAuthService = () => container.get<IAuthService>('Auth');

export const getApiService = () => container.get<IApiService>('Api');

export const getContactService = () =>
  container.get<IContactService>('Contact');

export const getMessageService = () =>
  container.get<IMessageService>('Message');

export const getConversationService = () =>
  container.get<IConversationService>('Conversation');

export const getGeolocationService = () =>
  container.get<IGeolocationService>('Geolocation');

export const getAddressService = () =>
  container.get<IAddressService>('Address');

export const getIPGeolocationService = () =>
  container.get<IIPGeolocationService>('IPGeolocation');

export const getRemoteConfigService = () =>
  container.get<IRemoteConfigService>('RemoteConfig');
