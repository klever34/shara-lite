import {useContext, useEffect, useState} from 'react';
import Realm from 'realm';
import Config from 'react-native-config';
import {Contact, Message, Conversation, Customer} from '../../models';
import {Payment} from '@/models/Payment';
import {Credit} from '@/models/Credit';
import {CreditPayment} from '@/models/CreditPayment';
import {Receipt} from '@/models/Receipt';
import {ReceiptItem} from '@/models/ReceiptItem';
import {Product} from '@/models/Product';
import {Supplier} from '@/models/Supplier';
import {StockItem} from '@/models/StockItem';
import {DeliveryAgent} from '@/models/DeliveryAgent';
import {RealmContext} from './provider';
import {Alert} from 'react-native';
import {StorageService} from '../storage';
import {ReceivedInventory} from '@/models/ReceivedInventory';
import {setRealmPartitionKey} from '@/models/baseSchema';
import {setBasePartitionKey} from '@/helpers/models';
import {runMigration} from '@/services/realm/migrations';

export const schema = [
  Contact,
  Conversation,
  Customer,
  Credit,
  CreditPayment,
  DeliveryAgent,
  StockItem,
  ReceivedInventory,
  Message,
  Payment,
  Product,
  Receipt,
  ReceiptItem,
  Supplier,
];

export const useRealm = (): Realm => {
  // @ts-ignore
  const {realm} = useContext(RealmContext);
  const [, rerender] = useState(false);
  useEffect(() => {
    const listener = () => rerender((flag) => !flag);
    realm?.addListener('change', listener);
    return () => {
      realm?.removeListener('change', listener);
    };
  }, [realm]);
  return <Realm>realm;
};

export const createRealm = async (options?: any): Promise<Realm> => {
  const partitionValue = await getRealmPartitionKey();
  setRealmPartitionKey(partitionValue);
  setBasePartitionKey(partitionValue);

  const config: Realm.Configuration = {
    schema,
    schemaVersion: 1,
    migration: (oldRealm) => {
      if (oldRealm.schemaVersion < 1) {
        // Do migration to schema version one here
      }
    },
  };

  if (options?.realmUser) {
    config.sync = {
      user: options.realmUser,
      partitionValue,
    };
    // @ts-ignore
    config.path = `sync-user-data-${partitionValue}`;
  }

  if (options && options.schemaVersion) {
    // @ts-ignore
    config.schemaVersion = options.schemaVersion;
  }

  return Realm.open(config);
};

export const loginToRealm = async ({
  jwt,
  hideError,
}: {
  jwt: 'string';
  hideError?: boolean;
}): Promise<{
  realm: Realm | null;
  realmUser?: any;
  partitionValue?: string;
}> => {
  try {
    const partitionValue = await getRealmPartitionKey();
    // @ts-ignore
    const credentials = Realm.Credentials.custom(jwt);
    const appConfig = {
      id: Config.ATLAS_REALM_APP_ID,
    };

    // @ts-ignore
    const app = new Realm.App(appConfig);
    const realmUser = await app.logIn(credentials);
    const realm = await createRealm({realmUser});
    return {
      realmUser,
      realm,
      partitionValue,
    };
  } catch (e) {
    if (!hideError) {
      Alert.alert('Error', e.message);
    }

    return {
      realm: null,
    };
  }
};

export const initLocalRealm = async (): Promise<Realm> => {
  try {
    const {schemaVersion} = runMigration({currentSchema: schema});
    const realm = await createRealm({schemaVersion});
    return realm;
  } catch (e) {
    throw e;
  }
};

const getRealmPartitionKey = async (): Promise<string> => {
  const storageService = new StorageService();
  const user = await storageService.getItem('user');
  // @ts-ignore
  return user ? user.id.toString() : '';
};

export * from './service';
