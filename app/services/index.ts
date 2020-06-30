import StorageService, {IStorageService} from './StorageService';
import ContactsService, {IContactsService} from './ContactsService';

let storageService: IStorageService | null = null;
let contactsService: IContactsService | null = null;

export const getStorageService = () => {
  if (!storageService) {
    storageService = new StorageService();
  }
  return storageService;
};

export const getContactsService = () => {
  if (!contactsService) {
    contactsService = new ContactsService();
  }
  return contactsService;
};
