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

export type PhoneContact = Omit<RNContacts.Contact, 'phoneNumbers'> & {
  phoneNumber: RNContacts.PhoneNumber;
};

export interface IContactService {
  getPhoneContacts(): Promise<PhoneContact[]>;
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

  private permissionGranted: boolean = false;

  private async checkPermission() {
    if (!this.permissionGranted) {
      return new Promise((resolve) => {
        Alert.alert(
          'Access to your contacts',
          'Shara would like to view your contacts.',
          [
            {
              text: 'Cancel',
              onPress: () => {
                this.permissionGranted = false;
                resolve(this.permissionGranted);
              },
            },
            {
              text: 'OK',
              onPress: () => {
                PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                )
                  .then((status) => {
                    this.permissionGranted = status === 'granted';
                    resolve(this.permissionGranted);
                  })
                  .catch(() => {
                    this.permissionGranted = false;
                    resolve(this.permissionGranted);
                  });
              },
            },
          ],
          {cancelable: false},
        );
      });
    }
    return this.permissionGranted;
  }

  public async getPhoneContacts() {
    if (await this.checkPermission()) {
      return new Promise<PhoneContact[]>((resolve, reject) => {
        RNContacts.getAll((err, phoneContacts) => {
          if (err) {
            reject(err);
          }
          const nextPhoneContacts: PhoneContact[] = [];
          phoneContacts.forEach((phoneContact) => {
            const numbersMap: {
              [key: string]: RNContacts.PhoneNumber;
            } = phoneContact.phoneNumbers.reduce((acc, curr) => {
              const numberWithoutWhitespace = curr.number.replace(/\s/g, '');
              return {
                ...acc,
                [numberWithoutWhitespace]: curr,
              };
            }, {});
            const uniquePhoneNumbers = Object.keys(numbersMap).map(
              (number) => numbersMap[number],
            );
            nextPhoneContacts.push(
              ...uniquePhoneNumbers.map((phoneNumber) => ({
                ...phoneContact,
                phoneNumber,
              })),
            );
          });
          resolve(nextPhoneContacts);
        });
      });
    }
    throw new Error('We are unable to access your contacts.');
  }

  public async syncPhoneContacts() {
    try {
      const contacts = await this.getPhoneContacts();
      const numbers = contacts.map(({phoneNumber}) => phoneNumber.number);
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
