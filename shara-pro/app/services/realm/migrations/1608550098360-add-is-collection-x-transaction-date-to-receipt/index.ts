import Realm from 'realm';
import {Contact} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Contact';
import {Conversation} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Conversation';
import {Credit} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {CreditPayment} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/CreditPayment';
import {DeliveryAgent} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/DeliveryAgent';
import {Message} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Message';
import {Payment} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {Supplier} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';

import {ReceiptItem} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/ReceiptItem';
import {StockItem} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/StockItem';
import {Product} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/Product';

import {Address} from '@/services/realm/migrations/1599826529206-customer-address/models/Address';
import {ReceivedInventory} from '@/services/realm/migrations/1599826529206-customer-address/models/ReceivedInventory';

import {Customer} from '@/services/realm/migrations/1604671961817-add-email-to-customer/models/Customer';

import {PaymentOption} from '@/services/realm/migrations/1606389607325-add-payment-options/models/PaymentOption';

import {
  IReceipt,
  Receipt,
} from '@/services/realm/migrations/1608550098360-add-is-collection-x-transaction-date-to-receipt/models/Receipt';

const migration = (oldRealm: Realm, newRealm: Realm) => {
  const oldReceiptItemObjects = oldRealm.objects<IReceipt>('Receipt');
  const newReceiptItemObjects = newRealm.objects<IReceipt>('Receipt');
  for (let i = 0; i < oldReceiptItemObjects.length; i++) {
    newReceiptItemObjects[i].transaction_date =
      oldReceiptItemObjects[i].created_at;
  }
};

const schema = [
  Address,
  Contact,
  Conversation,
  Credit,
  CreditPayment,
  Customer,
  DeliveryAgent,
  Message,
  Payment,
  PaymentOption,
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
