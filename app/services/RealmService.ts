import Realm from 'realm';
import {createContext, useContext, useEffect, useState} from 'react';
import {Contact, Conversation, IContact, Message} from '../models';

export interface IRealmService {
  getInstance(): Realm | null;

  setInstance(realm: Realm): void;

  createContact(
    contact: IContact,
    updateMode: Realm.UpdateMode,
  ): Promise<IContact>;

  createMultipleContacts(
    contact: IContact[],
    updateMode: Realm.UpdateMode,
  ): Promise<IContact[]>;

  updateContact(contact: Partial<IContact>): Promise<IContact>;

  updateMultipleContacts(contact: Partial<IContact[]>): Promise<IContact[]>;

  // createMessage(message: IMessage): Promise<IMessage>;
  // updateMessage(message: IMessage): Promise<IMessage>;
  //
  // createConversation(conversation: IConversation): Promise<IConversation>;
  // updateConversation(conversation: IConversation): Promise<IConversation>;
}

export default class RealmService implements IRealmService {
  private realm: Realm | null = null;

  public getInstance() {
    return this.realm;
  }

  public setInstance(realm: Realm) {
    if (!this.realm) {
      this.realm = realm;
    }
  }

  createContact(
    contact: IContact,
    updateMode: Realm.UpdateMode = Realm.UpdateMode.Never,
  ): Promise<IContact> {
    const realm = this.realm as Realm;
    return new Promise<IContact>((resolve, reject) => {
      try {
        realm.write(() => {
          const createdContact = realm.create<IContact>(
            'Contact',
            contact,
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
    updateMode: Realm.UpdateMode = Realm.UpdateMode.Never,
  ): Promise<IContact[]> {
    const realm = this.realm as Realm;
    return new Promise<IContact[]>((resolve, reject) => {
      try {
        realm.write(() => {
          const createdContacts = contacts.map((contact) => {
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
    return this.createContact(contact as IContact, Realm.UpdateMode.Modified);
  }

  updateMultipleContacts(contacts: Partial<IContact[]>): Promise<IContact[]> {
    return this.createMultipleContacts(
      contacts as IContact[],
      Realm.UpdateMode.Modified,
    );
  }

  // createConversation(conversation: IConversation): Promise<IConversation> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }
  //
  // updateConversation(conversation: IConversation): Promise<IConversation> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }
  //
  // createMessage(message: IMessage): Promise<IMessage> {
  //   return new Promise<IConversation>((resolve, reject) => {});
  // }
  //
  // updateMessage(message: IMessage): Promise<IMessage> {
  //   return new Promise<IMessage>((resolve, reject) => {});
  // }
}

const RealmContext = createContext<Realm | null>(null);
export const RealmProvider = RealmContext.Provider;
export const useRealm = () => {
  const realm = useContext(RealmContext) as Realm;
  const [, rerender] = useState(false);
  useEffect(() => {
    const listener = () => rerender((flag) => !flag);
    realm.addListener('change', listener);
    return () => {
      realm.removeListener('change', listener);
    };
  }, [realm]);
  return realm;
};

export const createRealm = async () => {
  Realm.deleteFile({});
  return Realm.open({
    schema: [Contact, Message, Conversation],
  });
};
