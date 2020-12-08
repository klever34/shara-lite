import {Contact} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Contact';
import {Conversation} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Conversation';
import {Credit} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {CreditPayment} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/CreditPayment';
import {DeliveryAgent} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/DeliveryAgent';
import {Message} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Message';
import {Payment} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {Supplier} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';

import {ReceiptItem} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/ReceiptItem';
import {StockItem} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/StockItem';
import {Product} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/Product';

import {Address} from 'app-v2/services/realm/migrations/1599826529206-customer-address/models/Address';
import {Customer} from 'app-v2/services/realm/migrations/1599826529206-customer-address/models/Customer';
import {Receipt} from 'app-v2/services/realm/migrations/1599826529206-customer-address/models/Receipt';
import {ReceivedInventory} from 'app-v2/services/realm/migrations/1599826529206-customer-address/models/ReceivedInventory';

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
