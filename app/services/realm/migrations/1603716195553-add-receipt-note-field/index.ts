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
import {Customer} from '@/services/realm/migrations/1599826529206-customer-address/models/Customer';
import {ReceivedInventory} from '@/services/realm/migrations/1599826529206-customer-address/models/ReceivedInventory';

import {Receipt} from '@/services/realm/migrations/1603716195553-add-receipt-note-field/models/Receipt';

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
  Product,
  Receipt,
  ReceiptItem,
  ReceivedInventory,
  StockItem,
  Supplier,
];

export default {
  schema,
};
