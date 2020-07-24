import {StorageService, IStorageService} from './storage';
import {ContactsService, IContactsService} from './contacts';
import {AuthService, IAuthService} from './auth';
import {RealmService, IRealmService} from './realm';
import {ApiService, IApiService} from './api';

let realmService: IRealmService | null = null;
let apiService: IApiService | null = null;
let storageService: IStorageService | null = null;
let contactsService: IContactsService | null = null;
let authService: IAuthService | null = null;

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
    authService = new AuthService(getStorageService());
  }
  return authService;
};

export const getApiService = () => {
  if (!apiService) {
    apiService = new ApiService(getAuthService(), getStorageService());
  }
  return apiService;
};

export const getContactsService = () => {
  if (!contactsService) {
    contactsService = new ContactsService(
      getRealmService(),
      getApiService(),
      getAuthService(),
    );
  }
  return contactsService;
};
