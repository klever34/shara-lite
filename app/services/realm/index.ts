import {useContext, useEffect, useState} from 'react';
import Realm from 'realm';
import {Contact, Message, Conversation, Customer} from '../../models';
import {Payment} from '../../models/Payment';
import {Credit} from '../../models/Credit';
import {CreditPayment} from '../../models/CreditPayment';
import {Receipt} from '../../models/Receipt';
import {ReceiptItem} from '../../models/ReceiptItem';
import {Product} from '../../models/Product';
import {Supplier} from '../../models/Supplier';
import {StockItem} from '../../models/StockItem';
import {DeliveryAgent} from '../../models/DeliveryAgent';
import {RealmContext} from './provider';
import {Alert, BackHandler, Platform} from 'react-native';
import {StorageService} from '../storage';
import {ReceivedInventory} from '../../models/ReceivedInventory';

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
  if (process.env.NODE_ENV === 'development') {
    // Realm.deleteFile({});
  }
  const partitionValue = await getRealmPartitionKey();

  const config: {
    schema: Array<object>;
  } = {schema};

  if (options && options.realmUser) {
    // @ts-ignore
    config.sync = {
      user: options.realmUser,
      partitionValue,
    };
  }

  return Realm.open(config as Realm.Configuration);
};

export const loginToRealm = async ({jwt}: {jwt: 'string'}): Promise<Realm> => {
  try {
    // @ts-ignore
    const credentials = Realm.Credentials.custom(jwt);
    const appId = 'shara-discovery-fhacl';
    const appConfig = {
      id: appId,
    };

    // @ts-ignore
    const app = new Realm.App(appConfig);
    const realmUser = await app.logIn(credentials);
    return await createRealm({realmUser});
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

export const initLocalRealm = async (): Promise<Realm> => {
  try {
    return await createRealm();
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
