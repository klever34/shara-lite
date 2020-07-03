import {PermissionsAndroid, Alert} from 'react-native';
import Contacts, {Contact} from 'react-native-contacts';

export interface IContactsService {
  getAll: () => Promise<Contact[]>;
}

export default class ContactsService implements IContactsService {
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
                  ).then((result) => {
                    if (result === 'granted') {
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
}
