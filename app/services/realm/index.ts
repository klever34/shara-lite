import {createContext, useContext, useEffect, useState} from 'react';
import Realm from 'realm';
import {Contact, Message, Conversation, Customer} from '../../models';
import {Payment} from '../../models/Payment';
import {PaymentItem} from '../../models/PaymentItem';

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
  if (process.env.NODE_ENV === 'development') {
    Realm.deleteFile({});
  }
  return Realm.open({
    schema: [Contact, Message, Conversation, Customer, Payment, PaymentItem],
  });
};

export * from './service';
