import {PermissionsAndroid} from 'react-native';
import Contacts, {Contact} from 'react-native-contacts';

export interface IContactsService {
  getAll: () => Promise<Contact[]>;
}

export default class ContactsService implements IContactsService {
  constructor() {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
      title: 'Contacts',
      message: 'This app would like to view your contacts.',
      buttonPositive: 'OK',
    }).then();
  }
  public async getAll() {
    return new Promise<Contact[]>((resolve, reject) => {
      Contacts.getAll((err, contacts) => {
        if (err === 'denied') {
          reject(err);
        } else {
          resolve(contacts);
        }
      });
    });
  }
}
