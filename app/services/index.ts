import StorageService, {IStorageService} from './StorageService';
import ContactsService, {IContactsService} from './ContactsService';
import AuthService, {IAuthService} from './AuthService';

let storageService: IStorageService | null = null;
let contactsService: IContactsService | null = null;
let authService: IAuthService | null = null;

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
    contactsService = new ContactsService();
  }
  return contactsService;
};
