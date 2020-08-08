import {useContext, useEffect, useState} from 'react';
import Realm from 'realm';
import {Contact} from '../../models/Contact';
import {Customer} from '../../models/Customer';
import {Message} from '../../models/Message';
import {Conversation} from '../../models/Conversation';
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
import {Alert, BackHandler, Platform} from 'react-native';
import {StorageService} from '../storage';

export const schema = [
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
    // @ts-ignore
    config.sync = {
      user: options.realmUser,
      partitionValue,
    };
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
    const realm = await createRealm({realmUser});
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
