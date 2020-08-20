import {StorageService, IStorageService} from './storage';
import {ContactService, IContactService} from './contact';
import {AuthService, IAuthService} from './auth';
import {RealmService, IRealmService} from './realm';
import {ApiService, IApiService} from './api';
import {IPubNubService, PubNubService} from './pubnub';
import {INavigationService, NavigationService} from './navigation';
import {AnalyticsService, IAnalyticsService} from './analytics';

let realmService: IRealmService | null = null;
let analyticsService: IAnalyticsService | null = null;
let pubNubService: IPubNubService | null = null;
let navigationService: INavigationService | null = null;
let apiService: IApiService | null = null;
let storageService: IStorageService | null = null;
let contactService: IContactService | null = null;
let authService: IAuthService | null = null;

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

export const getRealmService = () => {
  if (!realmService) {
    realmService = new RealmService(
      getApiService(),
      getAuthService(),
      getPubNubService(),
    );
  }
  return realmService;
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
