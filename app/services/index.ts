import StorageService, {IStorageService} from './storage/service';
import ContactsService, {IContactsService} from './contacts/service';
import AuthService, {IAuthService} from './auth/service';
import RealmService, {IRealmService} from './realm/service';
import ApiService, {IApiService} from './api/service';

let realmService: IRealmService | null = null;
let apiService: IApiService | null = null;
let storageService: IStorageService | null = null;
let contactsService: IContactsService | null = null;
let authService: IAuthService | null = null;

export const getApiService = () => {
  if (!apiService) {
    apiService = new ApiService();
  }
  return apiService as IApiService;
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

export const getAuthService = () => {
  if (!authService) {
    authService = new AuthService(getStorageService());
  }
  return authService;
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
