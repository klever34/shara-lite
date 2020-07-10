import Realm from 'realm';
import {createContext, useContext, useEffect, useState} from 'react';
import {Contact, Conversation, Message} from '../models';

export interface IRealmService {
  getInstance(): Realm | null;
  setInstance(realm: Realm): void;
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
