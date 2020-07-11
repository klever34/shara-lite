import StorageService, {IStorageService} from './StorageService';
import ContactsService, {IContactsService} from './ContactsService';
import AuthService, {IAuthService} from './AuthService';
import RealmService, {IRealmService} from './RealmService';
import ApiService, {IApiService} from './ApiService';

let realmService: IRealmService | null = null;
let apiService: IApiService | null = null;
let storageService: IStorageService | null = null;
let contactsService: IContactsService | null = null;
let authService: IAuthService | null = null;

export const getAuthService = () => {
  if (!authService) {
    authService = new AuthService(getStorageService());
  }
  return authService;
};

export const getApiService = () => {
  if (!apiService) {
    apiService = new ApiService();
  }
  return apiService;
};

export const getRealmService = () => {
  if (!realmService) {
    realmService = new RealmService();
  }
  return realmService as IRealmService;
};

export const getStorageService = () => {
  if (!storageService) {
    storageService = new StorageService();
  }
  return storageService;
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
