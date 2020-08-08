import {useContext, useEffect, useState} from 'react';
import Realm from 'realm';
import {omit} from 'lodash';
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
import {RealmContext} from './provider';
import {getRealmService} from '../index';
import {Alert, BackHandler, Platform} from 'react-native';
import {StorageService} from '../storage';

const defaultRealmPath = 'default.realm';

const schema = [
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
  if (process.env.NODE_ENV === 'development') {
    // Realm.deleteFile({});
  }

  const partitionValue = await getRealmPartitionKey();

  const config: {
    schema: Array<object>;
  } = {schema};

  if (options && options.realmUser) {
    // const realmService = getRealmService();
    // realmService.getInstance()?.close();

    // @ts-ignore
    config.sync = {
      user: options.realmUser,
      partitionValue,
    };

    // @ts-ignore
    // config.path = defaultRealmPath;
  }

  return Realm.open(config);
};

export const loginToRealm = async ({jwt}: {jwt: 'string'}): Promise<Realm> => {
  try {
    // @ts-ignore
    const credentials = Realm.Credentials.custom(jwt);
    const appId = 'shara-discovery-fhacl';
    const appConfig = {
      id: appId,
    };

    const app = new Realm.App(appConfig);
    const realmUser = await app.logIn(credentials);
    /*
    const realm = await createRealm({
      realmUser: JSON.parse(JSON.stringify(realmUser)),
    });
     */
    const realm = await createRealm({
      realmUser: JSON.parse(JSON.stringify(realmUser)),
    });
    console.log(
      'Realm user -->',
      app.currentUser,
      realm.Sync?.User,
      omit(realm, []),
    );
    const realmService = getRealmService();
    realmService.setInstance(realm);
    return realm;
  } catch (e) {
    console.error('Failed to log in', e);
    Alert.alert(
      'Oops! Something went wrong.',
      'Try clearing app data from application settings',
      [
        {
          text: 'OK',
          onPress: () => {
            if (process.env.NODE_ENV === 'production') {
              if (Platform.OS === 'android') {
                BackHandler.exitApp();
              }
            }
          },
        },
      ],
    );
    throw e;
  }
};

export const initRealm = async (): Promise<Realm> => {
  try {
    // @ts-ignore
    const realm = await createRealm();
    const realmService = getRealmService();
    realmService.setInstance(realm);
    return realm;
  } catch (e) {
    console.error('Failed to log in', e);
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
