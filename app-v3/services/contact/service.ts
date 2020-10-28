import {Alert, PermissionsAndroid} from 'react-native';
import RNContacts from 'react-native-contacts';
import flatten from 'lodash/flatten';
import {IApiService} from '../api';
import {IAuthService} from '../auth';
import {IContact} from 'app-v3/models';
import {IRealmService} from '../realm';
import omit from 'lodash/omit';
import {UpdateMode} from 'realm';
import {getBaseModelValues} from 'app-v3/helpers/models';
import {User} from 'types-v3/app';
import {uniqBy} from 'lodash';
import parsePhoneNumber from 'libphonenumber-js';
import {IIPGeolocationService} from 'app-v3/services/ip-geolocation';

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
  formatPhoneNumber(number: string): string;
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

  private async checkPermission() {
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

  public formatPhoneNumber(phoneNumber: string): string {
    const removeAllNonDigits = (number: string) =>
      number.replace(/[^\d+]/g, '');
    if (phoneNumber[0] !== '+') {
      let countryCallingCode;
      const ipDetails = this.ipGeolocationService.getUserIpDetails();
      if (ipDetails) {
        countryCallingCode = ipDetails.calling_code;
      } else {
        countryCallingCode = this.authService.getUser()?.country_code ?? '';
      }
      if (!countryCallingCode) {
        return removeAllNonDigits(phoneNumber);
      }
      phoneNumber =
        `${countryCallingCode[0] === '+' ? '' : '+'}${countryCallingCode}` +
        phoneNumber;
    }
    const phoneNumberDetails = parsePhoneNumber(phoneNumber);
    if (!phoneNumberDetails || !phoneNumberDetails.isValid()) {
      return removeAllNonDigits(phoneNumber);
    }
    return String(phoneNumberDetails.number);
  }

  public async getPhoneContacts() {
    if (await this.checkPermission()) {
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
}
