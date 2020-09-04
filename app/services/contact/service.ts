import {Alert, PermissionsAndroid} from 'react-native';
import RNContacts from 'react-native-contacts';
import flatten from 'lodash/flatten';
import {IApiService} from '../api';
import {IAuthService} from '../auth';
import {IContact} from '@/models';
import {IRealmService} from '../realm';
import omit from 'lodash/omit';
import {UpdateMode} from 'realm';
import {getBaseModelValues} from '@/helpers/models';
import {User} from 'types/app';

export interface IContactService {
  getPhoneContacts(): Promise<RNContacts.Contact[]>;
  syncPhoneContacts(): Promise<void>;
  syncMobiles(
    mobiles: string[],
    setFields?: (user: User, index: number) => Partial<IContact>,
  ): Promise<void>;
  getContactByMobile(mobile: string): IContact | null;
  getContact(id: string): IContact | null;
  createContact(contact: IContact): Promise<IContact>;
  createMultipleContacts(contact: IContact[]): Promise<IContact[]>;
  updateContact(contact: Partial<IContact>): Promise<IContact>;
  updateMultipleContacts(contact: Partial<IContact[]>): Promise<IContact[]>;
}

const parseDateString = (dateString: string) => {
  const parsed = Date.parse(dateString);
  return parsed ? new Date(parsed) : new Date();
};

export class ContactService implements IContactService {
  constructor(
    private realmService: IRealmService,
    private apiService: IApiService,
    private authService: IAuthService,
  ) {}

  private async checkPermission() {
    return new Promise((resolve) => {
      RNContacts.checkPermission((error, result) => {
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

  public async getPhoneContacts() {
    return new Promise<RNContacts.Contact[]>((resolve, reject) => {
      this.checkPermission().then((hasPermission) => {
        const error = new Error('We are unable to access your contacts');
        if (hasPermission) {
          RNContacts.getAll((err, contacts) => {
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

  public async syncPhoneContacts() {
    try {
      const contacts = await this.getPhoneContacts();
      const numbers = flatten(
        contacts.map((contact) =>
          contact.phoneNumbers.map((phoneNumber) =>
            phoneNumber.number.replace(' ', ''),
          ),
        ),
      );
      await this.syncMobiles(numbers, (_, index) => {
        return {
          recordId: contacts[index]?.recordID,
        };
      });
    } catch (error) {
      throw error;
    }
  }

  public async syncMobiles(
    mobiles: string[],
    setFields?: (user: User, index: number) => Partial<IContact>,
  ) {
    mobiles = flatten(mobiles.map((mobile) => mobile.replace(' ', '')));
    try {
      const users = await this.apiService.getUserDetails(mobiles);
      const me = this.authService.getUser();
      const nextContacts = users.map<IContact>((user, index) => {
        return {
          ...user,
          created_at: parseDateString(user.created_at),
          updated_at: parseDateString(user.updated_at),
          isMe: user.id === me?.id,
          groups: '',
          fullName: '',
          ...setFields?.(user, index),
        };
      });
      await this.updateMultipleContacts(nextContacts);
    } catch (error) {
      throw error;
    }
  }

  getContactByMobile(mobile: string): IContact | null {
    const realm = this.realmService.getInstance();
    const foundContacts = realm
      ?.objects<IContact>('Contact')
      .filtered(`mobile = "${mobile}" LIMIT(1)`);
    return foundContacts?.length ? (omit(foundContacts[0]) as IContact) : null;
  }

  getContact(id: string): IContact | null {
    const realm = this.realmService.getInstance();
    return realm?.objectForPrimaryKey<IContact>('Contact', id) || null;
  }

  private prepareContact(contact: IContact): IContact {
    if (contact._id) {
      return contact;
    }
    const prevContact = this.getContactByMobile(contact.mobile);
    if (prevContact) {
      contact = {
        _id: prevContact._id,
        ...contact,
      };
    } else {
      contact = {
        ...contact,
        ...getBaseModelValues(),
      };
    }
    return contact;
  }

  createContact(contact: IContact): Promise<IContact> {
    const realm = this.realmService.getInstance();
    return new Promise<IContact>((resolve, reject) => {
      try {
        realm?.write(() => {
          const createdContact = realm.create<IContact>(
            'Contact',
            this.prepareContact(contact),
            UpdateMode.Modified,
          );
          resolve(createdContact);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  createMultipleContacts(contacts: IContact[]): Promise<IContact[]> {
    const realm = this.realmService.getInstance();
    return new Promise<IContact[]>((resolve, reject) => {
      try {
        realm?.write(() => {
          const createdContacts = contacts.map((contact) => {
            return realm.create<IContact>(
              'Contact',
              this.prepareContact(contact),
              UpdateMode.Modified,
            );
          });
          resolve(createdContacts);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  updateContact(contact: Partial<IContact>): Promise<IContact> {
    return this.createContact(contact as IContact);
  }

  updateMultipleContacts(contacts: Partial<IContact[]>): Promise<IContact[]> {
    return this.createMultipleContacts(contacts as IContact[]);
  }
}
