import {Contact} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Contact';
import {Conversation} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Conversation';
import {Credit} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {CreditPayment} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/CreditPayment';
import {Customer} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Customer';
import {DeliveryAgent} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/DeliveryAgent';
import {Message} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Message';
import {Payment} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {Receipt} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Receipt';
import {ReceivedInventory} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/ReceivedInventory';
import {Supplier} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';

import {
  ReceiptItem,
  IReceiptItem,
} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/ReceiptItem';
import Realm from 'realm';
import {
  StockItem,
  IStockItem,
} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/StockItem';
import {
  Product,
  IProduct,
} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/Product';

const migration = (oldRealm: Realm, newRealm: Realm) => {
  const oldReceiptItemObjects = oldRealm.objects<IReceiptItem>('ReceiptItem');
  const newReceiptItemObjects = newRealm.objects<IReceiptItem>('ReceiptItem');
  for (let i = 0; i < oldReceiptItemObjects.length; i++) {
    newReceiptItemObjects[i].quantity = oldReceiptItemObjects[i].quantity;
  }

  const oldStockItemObjects = oldRealm.objects<IStockItem>('StockItem');
  const newStockItemObjects = newRealm.objects<IStockItem>('StockItem');
  for (let i = 0; i < oldStockItemObjects.length; i++) {
    newStockItemObjects[i].quantity = oldStockItemObjects[i].quantity;
  }

  const oldProductObjects = oldRealm.objects<IProduct>('Product');
  const newProductObjects = newRealm.objects<IProduct>('Product');
  for (let i = 0; i < oldProductObjects.length; i++) {
    newProductObjects[i].quantity = oldProductObjects[i].quantity;
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
  schema,
  migration,
};
