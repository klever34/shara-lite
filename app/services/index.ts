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

let navigationService: INavigationService | null = null;
let analyticsService: IAnalyticsService | null = null;
let pubNubService: IPubNubService | null = null;
let realmService: IRealmService | null = null;
let storageService: IStorageService | null = null;
let authService: IAuthService | null = null;
let apiService: IApiService | null = null;
let contactService: IContactService | null = null;
let messageService: IMessageService | null = null;
let conversationService: IConversationService | null = null;

export const getNavigationService = () => {
  if (!navigationService) {
    navigationService = new NavigationService();
  }
  return navigationService;
};

export const getAnalyticsService = () => {
  if (!analyticsService) {
    analyticsService = new AnalyticsService();
  }
  return analyticsService;
};

export const getPubNubService = () => {
  if (!pubNubService) {
    pubNubService = new PubNubService();
  }
  return pubNubService;
};

export const getRealmService = () => {
  if (!realmService) {
    realmService = new RealmService();
  }
  return realmService;
};

export const getStorageService = () => {
  if (!storageService) {
    storageService = new StorageService();
  }
  return storageService;
};

export const getAuthService = () => {
  if (!authService) {
    authService = new AuthService(
      getStorageService(),
      getPubNubService(),
      getNavigationService(),
    );
  }
  return authService;
};

export const getApiService = () => {
  if (!apiService) {
    apiService = new ApiService(getAuthService(), getStorageService());
  }
  return apiService;
};

export const getContactService = () => {
  if (!contactService) {
    contactService = new ContactService(
      getRealmService(),
      getApiService(),
      getAuthService(),
    );
  }
  return contactService;
};

export const getMessageService = () => {
  if (!messageService) {
    messageService = new MessageService(getRealmService(), getPubNubService());
  }
  return messageService;
};

export const getConversationService = () => {
  if (!conversationService) {
    conversationService = new ConversationService(
      getRealmService(),
      getPubNubService(),
      getAuthService(),
      getApiService(),
    );
  }
  return conversationService;
};
