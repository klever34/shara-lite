import {createContext, useContext, useEffect, useState} from 'react';
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
import {getAuthService, getRealmService} from '../index';
import {Alert, BackHandler, Platform} from 'react-native';
import {AuthService} from '../auth';

const schema = [
  // Contact,
  // Conversation,
  Customer,
  Credit,
  CreditPayment,
  DeliveryAgent,
  InventoryStock,
  // Message,
  Payment,
  Product,
  Receipt,
  ReceiptItem,
  Supplier,
];

const authService = getAuthService();

export const useRealm = () => {
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
  return realm;
};

export const createRealm = async ({realmUser}: {realmUser: any}) => {
  if (process.env.NODE_ENV === 'development') {
    // Realm.deleteFile({});
  }

  const config = {
    schema,
    sync: {
      user: realmUser,
      partitionValue: getRealmPartitionKey(),
    },
  };
  return Realm.open(config);
};

export const loginToRealm = async () => {
  try {
    const jwt = authService.getRealmJwt();
    const credentials = Realm.Credentials.custom(jwt);
    const appId = 'shara-discovery-fhacl';
    const appConfig = {
      id: appId,
    };
    // @ts-ignore
    const app = new Realm.App(appConfig);
    const realmUser = await app.logIn(credentials);
    // @ts-ignore
    const realm = await createRealm({realmUser});
    console.log('Realm user -->', realm, omit(realm, []));
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

export const getRealmPartitionKey = () => {
  const user = authService.getUser();
  return user?.id;
};

export * from './service';
