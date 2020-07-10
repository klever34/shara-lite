import {PermissionsAndroid, Alert} from 'react-native';
import Contacts, {Contact} from 'react-native-contacts';
import flatten from 'lodash/flatten';
import {requester} from './api/config';
import {getAuthService} from './index';
import {IAuthService} from './AuthService';
import {IContact} from '../models';
import {UpdateMode} from 'realm';
import {IRealmService} from './RealmService';

export interface IContactsService {
  getAll: () => Promise<Contact[]>;
  loadContacts: () => Promise<void>;
}

export default class ContactsService implements IContactsService {
  constructor(public realmService: IRealmService) {}

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
    this.getAll()
      .then((nextContacts) => {
        const sizePerRequest = 20;
        const numbers = flatten(
          nextContacts.map((contact) =>
            contact.phoneNumbers.map((phoneNumber) => phoneNumber.number),
          ),
        );
        const requestNo = Math.ceil(numbers.length / sizePerRequest);
        return Promise.all(
          Array.from({length: requestNo}).map((_, index) => {
            return requester.post<{users: User[]}>('/users/check', {
              mobiles: numbers.slice(
                sizePerRequest * index,
                sizePerRequest * index + sizePerRequest,
              ),
            });
          }),
        );
      })
      .then((responses: ApiResponse<{users: User[]}>[]) => {
        const users = flatten(responses.map(({data}) => data.users));
        const authService = getAuthService() as IAuthService;
        const me = authService.getUser() as User;
        const realm = this.realmService.getInstance() as Realm;
        try {
          realm.write(() => {
            (users as User[]).forEach((user) => {
              if (me.id !== user.id) {
                realm.create<IContact>('Contact', user, UpdateMode.Modified);
              }
            });
          });
        } catch (error) {
          console.log('Error: ', error);
        }
      });
  }
}
