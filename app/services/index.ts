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

const createDIContainer = (): IDIContainer => {
  const container = new DIContainer();
  container.addDefinitions({
    Navigation: object(NavigationService),
    Analytics: object(AnalyticsService),
    PubNub: object(PubNubService),
    Realm: object(RealmService),
    Storage: object(StorageService),
    Auth: object(AuthService).construct(
      get('Storage'),
      get('PubNub'),
      get('Navigation'),
    ),
    Api: object(ApiService).construct(get('Auth'), get('Storage')),
    Contact: object(ContactService).construct(
      get('Realm'),
      get('Api'),
      get('Auth'),
    ),
    Message: object(MessageService).construct(get('Realm'), get('PubNub')),
    Conversation: object(ConversationService).construct(
      get('Realm'),
      get('PubNub'),
      get('Auth'),
      get('Api'),
      get('Contact'),
    ),
  });
  return container;
};

export const container = createDIContainer();

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
