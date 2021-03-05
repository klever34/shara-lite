import Realm from 'realm';
import Config from 'react-native-config';
import {Alert} from 'react-native';
import perf from '@react-native-firebase/perf';
import {Address} from '@/models/Address';
import {Contact, Conversation, Customer, Message} from '../../../models';
import {Payment} from '@/models/Payment';
import {Credit} from '@/models/Credit';
import {CreditPayment} from '@/models/CreditPayment';
import {Receipt} from '@/models/Receipt';
import {ReceiptItem} from '@/models/ReceiptItem';
import {Product} from '@/models/Product';
import {Supplier} from '@/models/Supplier';
import {StockItem} from '@/models/StockItem';
import {DeliveryAgent} from '@/models/DeliveryAgent';
import {PaymentOption} from '@/models/PaymentOption';
import {StorageService} from '../../storage';
import {ReceivedInventory} from '@/models/ReceivedInventory';
import {PaymentReminder} from '@/models/PaymentReminder';
import {Feedback} from '@/models/Feedback';
import {LastSeen} from '@/models/LastSeen';
import {Activity} from '@/models/Activity';
import {Wallet} from '@/models/Wallet';
import {CollectionMethod} from '@/models/CollectionMethod';
import {Collection} from '@/models/Collection';
import {DisbursementMethod} from '@/models/DisbursementMethod';
import {Disbursement} from '@/models/Disbursement';
import {Drawdown} from '@/models/Drawdown';
import {DrawdownRepayment} from '@/models/DrawdownRepayment';
import {setRealmPartitionKey} from '@/models/baseSchema';
import {setBasePartitionKey} from '@/helpers/models';
import {runMigration} from '@/services/realm/migrations';

export const schema = [
  Address,
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
  PaymentOption,
  PaymentReminder,
  Product,
  Receipt,
  ReceiptItem,
  Supplier,
  Feedback,
  LastSeen,
  Activity,
  Wallet,
  CollectionMethod,
  Collection,
  DisbursementMethod,
  Disbursement,
  Drawdown,
  DrawdownRepayment,
];

export const createLocalRealm = async () => {
  try {
    const trace = await perf().startTrace('initLocalRealm');
    const {schemaVersion} = runMigration({currentSchema: schema});
    const realm = await createRealm({schemaVersion});
    await trace.stop();
    return realm;
  } catch (e) {
    throw e;
  }
};

export const createSyncRealm = async ({
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
    const trace = await perf().startTrace('loginToRealm');
    const partitionValue = await getRealmPartitionKey();
    const credentials = Realm.Credentials.jwt(jwt);
    const appConfig = {
      id: Config.ATLAS_REALM_APP_ID,
    };

    const app = new Realm.App(appConfig);
    Realm.App.Sync.setLogLevel(app, 'all');

    const realmUser = await app.logIn(credentials);
    const realm = await createRealm({realmUser});
    await trace.stop();
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

const getRealmPartitionKey = async (): Promise<string> => {
  const storageService = new StorageService();
  const user = await storageService.getItem('user');
  // @ts-ignore
  return user ? user.id.toString() : '';
};

const createRealm = async (options?: any): Promise<Realm> => {
  const partitionValue = await getRealmPartitionKey();
  setRealmPartitionKey(partitionValue);
  setBasePartitionKey(partitionValue);

  const config: Realm.Configuration = {schema};

  if (options?.realmUser) {
    config.sync = {
      user: options.realmUser,
      partitionValue,
    };
    config.path = `sync-user-data-${partitionValue}-v4-${partitionValue}`;
  }

  if (options && options.schemaVersion) {
    config.schemaVersion = options.schemaVersion;
  }

  return Realm.open(config);
};
