import Realm from 'realm';

import {Contact} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Contact';
import {Conversation} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Conversation';
import {Credit} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {CreditPayment} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/CreditPayment';
import {Customer} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Customer';
import {DeliveryAgent} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/DeliveryAgent';
import {Message} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Message';
import {Payment} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {Product} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Product';
import {Receipt} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Receipt';
import {ReceiptItem} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/ReceiptItem';
import {ReceivedInventory} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/ReceivedInventory';
import {StockItem} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/StockItem';
import {Supplier} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';

const migration = (oldRealm: Realm, newRealm: Realm) => {
  const newRealmSchema = newRealm.schema;
  newRealmSchema.forEach((objSchema) => {
    const allObjects = newRealm.objects(objSchema.name);
    allObjects.forEach((obj: any) => {
      obj.is_deleted = false;
    });
  });
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
