import {Alert, PermissionsAndroid} from 'react-native';
import Contacts, {Contact} from 'react-native-contacts';
import flatten from 'lodash/flatten';
import {IApiService} from '../api/service';
import {IAuthService} from '../auth/service';
import {IContact} from '../../models';
import {IRealmService} from '../realm/service';

export interface IContactsService {
  getAll: () => Promise<Contact[]>;
  loadContacts: () => Promise<void>;
}

export default class ContactsService implements IContactsService {
  constructor(
    private realmService: IRealmService,
    private apiService: IApiService,
    private authService: IAuthService,
  ) {}

  private async checkPermission() {
    return new Promise((resolve) => {
      Contacts.checkPermission((error, result) => {
        if (result === 'authorized') {
          resolve(true);
        } else {
          Alert.alert(
            'Access to your contacts',
            'Shara would like to view your contacts.',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  resolve(false);
                },
              },
              {
                text: 'OK',
                onPress: () => {
                  PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                  ).then((status) => {
                    if (status === 'granted') {
                      resolve(true);
                    } else {
                      resolve(false);
                    }
                  });
                },
              },
            ],
            {cancelable: false},
          );
        }
      });
    });
  }

  public async getAll() {
    return new Promise<Contact[]>((resolve, reject) => {
      this.checkPermission().then((hasPermission) => {
        const error = new Error('We are unable to access your contacts');
        if (hasPermission) {
          Contacts.getAll((err, contacts) => {
            if (err) {
              reject(err);
            }
            if (contacts) {
              resolve(contacts);
            } else {
              reject(error);
            }
          });
        } else {
          reject(error);
        }
      });
    });
  }

  public async loadContacts() {
    try {
      const contacts = await this.getAll();
      const me = this.authService.getUser() as User;
      const numbers = flatten(
        contacts.map((contact) =>
          contact.phoneNumbers.map((phoneNumber) =>
            phoneNumber.number.replace(' ', ''),
          ),
        ),
      );
      const users = await this.apiService.getUserDetails(numbers);
      await this.realmService.updateMultipleContacts(
        (users.filter((user) => user.id !== me.id) as unknown) as IContact[],
      );
    } catch (error) {
      console.log('Error: ', error.message);
    }
  }
}
