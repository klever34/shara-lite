import Realm from 'realm';
import {omit} from 'lodash';

import {Contact} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Contact';
import {Conversation} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Conversation';
import {Credit} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Credit';
import {CreditPayment} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/CreditPayment';
import {Customer} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Customer';
import {DeliveryAgent} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/DeliveryAgent';
import {Message} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Message';
import {Payment} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Payment';
import {
  IProduct,
  Product,
} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Product';
import {Receipt} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Receipt';
import {ReceiptItem} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/ReceiptItem';
import {ReceivedInventory} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/ReceivedInventory';
import {StockItem} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/StockItem';
import {Supplier} from '@/services/realm/migrations/1598342143007-add-test-to-payment/models/Supplier';

const migration = (oldRealm: Realm, newRealm: Realm) => {
  const oldObjects = (oldRealm.objects('Product') as unknown) as IProduct[];
  const newObjects = (newRealm.objects('Product') as unknown) as IProduct[];

  console.log(oldObjects.length, newObjects.length);
  console.log('----->', omit(oldObjects[0]));
  console.log('----->', omit(newObjects[0]));

  // loop through all objects and set the name property in the new schema
  for (let i = 0; i < oldObjects.length; i++) {
    newObjects[i].test = oldObjects[i].name + ' ' + oldObjects[i].sku;
  }
};

const schema = [
  Contact,
  Conversation,
  Credit,
  CreditPayment,
  Customer,
  DeliveryAgent,
  Message,
  Payment,
  Product,
  Receipt,
  ReceiptItem,
  ReceivedInventory,
  StockItem,
  Supplier,
];

export default {
  migration,
  schema,
};
