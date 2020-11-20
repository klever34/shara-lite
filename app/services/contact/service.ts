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
import {uniqBy} from 'lodash';
import * as LibPhoneNumber from 'libphonenumber-js';
import {IIPGeolocationService} from '@/services/ip-geolocation';
import * as RNSelectContact from 'react-native-select-contact';

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
  parsePhoneNumber(number: string): LibPhoneNumber.PhoneNumber | undefined;
  formatPhoneNumber(number: string): string;
  addContact(contact: {
    givenName: string;
    phoneNumbers: string[] | {label: string; number: string}[];
  }): Promise<void>;
  selectContactPhone(): Promise<RNSelectContact.ContactPhoneSelection | null>;
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
    private ipGeolocationService: IIPGeolocationService,
  ) {}

  private permissionGranted: boolean = false;
  private writePermissionGranted: boolean = false;

  private async checkReadPermission() {
    this.permissionGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    );
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

  private async checkWritePermission() {
    this.permissionGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
    );
    if (!this.writePermissionGranted) {
      return new Promise((resolve) => {
        Alert.alert(
          'Write to your contacts',
          'Shara would like to write to your contacts.',
          [
            {
              text: 'Cancel',
              onPress: () => {
                this.writePermissionGranted = false;
                resolve(this.writePermissionGranted);
              },
            },
            {
              text: 'OK',
              onPress: () => {
                PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
                )
                  .then((status) => {
                    this.writePermissionGranted = status === 'granted';
                    resolve(this.writePermissionGranted);
                  })
                  .catch(() => {
                    this.writePermissionGranted = false;
                    resolve(this.writePermissionGranted);
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

  private removeAllNonDigits(number: string) {
    return number.replace(/[^\d+]/g, '');
  }

  public parsePhoneNumber(
    phoneNumber: string,
  ): LibPhoneNumber.PhoneNumber | undefined {
    if (phoneNumber[0] !== '+') {
      let countryCallingCode;
      const ipDetails = this.ipGeolocationService.getUserIpDetails();
      if (ipDetails) {
        countryCallingCode = ipDetails.calling_code;
      } else {
        countryCallingCode = this.authService.getUser()?.country_code ?? '';
      }
      if (!countryCallingCode) {
        return;
      }
      phoneNumber =
        `${countryCallingCode[0] === '+' ? '' : '+'}${countryCallingCode}` +
        phoneNumber;
    }
    return LibPhoneNumber.parsePhoneNumberFromString(phoneNumber);
  }

  public formatPhoneNumber(phoneNumber: string): string {
    const parsedPhoneNumber = this.parsePhoneNumber(phoneNumber);
    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      return this.removeAllNonDigits(phoneNumber);
    }
    return String(parsedPhoneNumber.number);
  }

  public async addContact(contact: {
    givenName: string;
    phoneNumbers: (string | {label: string; number: string})[];
  }) {
    if (await this.checkWritePermission()) {
      return new Promise<void>((resolve, reject) => {
        RNContacts.addContact(
          {
            givenName: contact.givenName,
            phoneNumbers: contact.phoneNumbers.map((number) => {
              if (typeof number === 'string') {
                return {
                  label: 'mobile',
                  number,
                };
              }
              return number;
            }),
          } as RNContacts.Contact,
          (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          },
        );
      });
    }
    throw new Error('We are unable to access your contacts.');
  }

  public async getPhoneContacts() {
    if (await this.checkReadPermission()) {
      return new Promise<PhoneContact[]>((resolve, reject) => {
        RNContacts.getAll((err, phoneContacts) => {
          if (err) {
            reject(err);
          }
          let nextPhoneContacts: PhoneContact[] = [];
          phoneContacts.forEach(({phoneNumbers, ...phoneContact}) => {
            const uniquePhoneNumbers = uniqBy(phoneNumbers, (item) =>
              this.formatPhoneNumber(item.number),
            );
            nextPhoneContacts.push(
              ...uniquePhoneNumbers.map((phoneNumber) => ({
                ...phoneContact,
                phoneNumber,
              })),
            );
          });
          nextPhoneContacts = uniqBy(nextPhoneContacts, (item) =>
            this.formatPhoneNumber(item.phoneNumber.number),
          );
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

  public async selectContactPhone(): Promise<RNSelectContact.ContactPhoneSelection | null> {
    if (await this.checkReadPermission()) {
      return RNSelectContact.selectContactPhone();
    } else {
      throw new Error('We are unable to access your contacts.');
    }
  }
}
