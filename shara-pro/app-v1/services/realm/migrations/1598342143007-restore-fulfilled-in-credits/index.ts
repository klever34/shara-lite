import Realm from 'realm';
import {Contact} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Contact';
import {Conversation} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Conversation';
import {
  Credit,
  ICredit,
} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {CreditPayment} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/CreditPayment';
import {Customer} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Customer';
import {DeliveryAgent} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/DeliveryAgent';
import {Message} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Message';
import {Payment} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {Product} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Product';
import {Receipt} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Receipt';
import {ReceiptItem} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/ReceiptItem';
import {ReceivedInventory} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/ReceivedInventory';
import {StockItem} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/StockItem';
import {Supplier} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';

const migration = (oldRealm: Realm, newRealm: Realm) => {
  const oldObjects = oldRealm.objects<ICredit>('Credit');
  const newObjects = newRealm.objects<ICredit>('Credit');

  // loop through all objects and set the name property in the new schema
  for (let i = 0; i < oldObjects.length; i++) {
    newObjects[i].fulfilled = !!oldObjects[i].fulfilled;
  }

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
