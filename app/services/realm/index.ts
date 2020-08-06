import {createContext, useContext, useEffect, useState} from 'react';
import Realm from 'realm';
import {Contact, Message, Conversation, Customer} from '../../models';
import {Payment} from '../../models/Payment';
import {Credit} from '../../models/Credit';
import {CreditPayment} from '../../models/CreditPayment';
import {Receipt} from '../../models/Receipt';
import {ReceiptItem} from '../../models/ReceiptItem';
import {Product} from '../../models/Product';
import {Supplier} from '../../models/Supplier';
import {InventoryStock} from '../../models/InventoryStock';
import {DeliveryAgent} from '../../models/DeliveryAgent';

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
    schema: [
      Contact,
      Conversation,
      Customer,
      Credit,
      CreditPayment,
      DeliveryAgent,
      InventoryStock,
      Message,
      Payment,
      Product,
      Receipt,
      ReceiptItem,
      Supplier,
    ],
  });
};

export * from './service';
