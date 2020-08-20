import {Alert, PermissionsAndroid} from 'react-native';
import Contacts, {Contact} from 'react-native-contacts';
import flatten from 'lodash/flatten';
import {IApiService} from '../api';
import {IAuthService} from '../auth';
import {IContact} from '@/models';
import {IRealmService} from '../realm';
import omit from 'lodash/omit';
import {UpdateMode} from 'realm';
import {getBaseModelValues} from '@/helpers/models';

export interface IContactService {
  getAll(): Promise<Contact[]>;
  loadContacts(): Promise<void>;
  getContactByMobile(mobile: string): IContact | null;
  getContact(id: string): IContact | null;
  createContact(contact: IContact, updateMode: UpdateMode): Promise<IContact>;
  createMultipleContacts(
    contact: IContact[],
    updateMode: UpdateMode,
  ): Promise<IContact[]>;
  updateContact(contact: Partial<IContact>): Promise<IContact>;
  updateMultipleContacts(contact: Partial<IContact[]>): Promise<IContact[]>;
}

export class ContactService implements IContactService {
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
      const me = this.authService.getUser();
      const numbers = flatten(
        contacts.map((contact) =>
          contact.phoneNumbers.map((phoneNumber) =>
            phoneNumber.number.replace(' ', ''),
          ),
        ),
      );
      const users = await this.apiService.getUserDetails(numbers);
      const nextContacts = users.map((user) => {
        return {
          ...user,
          isMe: user.id === me?.id,
          groups: '',
        };
      });
      await this.updateMultipleContacts(
        (nextContacts as unknown) as IContact[],
      );
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

  createContact(
    contact: IContact,
    updateMode: UpdateMode = UpdateMode.Never,
  ): Promise<IContact> {
    const realm = this.realmService.getInstance();
    return new Promise<IContact>((resolve, reject) => {
      const existingMobile = this.getContactByMobile(contact.mobile);
      const updatePayload = existingMobile || getBaseModelValues();
      try {
        realm?.write(() => {
          const createdContact = realm.create<IContact>(
            'Contact',
            {...contact, ...updatePayload},
            updateMode,
          );
          resolve(createdContact);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  createMultipleContacts(
    contacts: IContact[],
    updateMode: UpdateMode = UpdateMode.Never,
  ): Promise<IContact[]> {
    const realm = this.realmService.getInstance();
    return new Promise<IContact[]>((resolve, reject) => {
      try {
        const existingContacts = realm?.objects<IContact>('Contact');
        const contactsWithBaseValues = contacts
          .map((contact) => ({
            ...contact,
            ...getBaseModelValues(),
          }))
          .filter(
            (contact) =>
              !existingContacts?.find(({mobile}) => contact.mobile === mobile),
          );
        realm?.write(() => {
          const createdContacts = contactsWithBaseValues.map((contact) => {
            return realm.create<IContact>('Contact', contact, updateMode);
          });
          resolve(createdContacts);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  updateContact(contact: Partial<IContact>): Promise<IContact> {
    return this.createContact(contact as IContact, UpdateMode.Modified);
  }

  updateMultipleContacts(contacts: Partial<IContact[]>): Promise<IContact[]> {
    return this.createMultipleContacts(
      contacts as IContact[],
      UpdateMode.Modified,
    );
  }
}
