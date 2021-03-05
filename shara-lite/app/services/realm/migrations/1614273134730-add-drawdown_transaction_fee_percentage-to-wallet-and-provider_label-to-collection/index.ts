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

import {PaymentOption} from '@/services/realm/migrations/1606389607325-add-payment-options/models/PaymentOption';

import {Receipt} from '@/services/realm/migrations/1608550098360-add-is-collection-x-transaction-date-to-receipt/models/Receipt';

import {PaymentReminder} from '@/services/realm/migrations/1608634902886-add-payment-reminder/models/PaymentReminder';

import {Feedback} from '@/services/realm/migrations/1610377039908-add-feedback-model/models/Feedback';

import {LastSeen} from '@/services/realm/migrations/1611048927106-add-last-seen-model/models/LastSeen';

import {Activity} from '@/services/realm/migrations/1611236083669-add-activity-x-disable-customer-reminders/models/Activity';

import {Customer} from '@/services/realm/migrations/1611256639370-re-add-disable-customer-reminders/models/Customer';

import {Collection} from '@/services/realm/migrations/1614273134730-add-drawdown_transaction_fee_percentage-to-wallet-and-provider_label-to-collection/models/Collection';
import {Disbursement} from '@/services/realm/migrations/1614273134730-add-drawdown_transaction_fee_percentage-to-wallet-and-provider_label-to-collection/models/Disbursement';

import {CollectionMethod} from '@/services/realm/migrations/1613546853297-add-is_primary_to_collection_disbursment_methods/models/CollectionMethod';
import {DisbursementMethod} from '@/services/realm/migrations/1613546853297-add-is_primary_to_collection_disbursment_methods/models/DisbursementMethod';

import {Wallet} from '@/services/realm/migrations/1614273134730-add-drawdown_transaction_fee_percentage-to-wallet-and-provider_label-to-collection/models/Wallet';
import {Drawdown} from '@/services/realm/migrations/1614251072879-add-repayment-date-to-wallet-and-drawdown/models/Drawdown';

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
  PaymentReminder,
  Product,
  Receipt,
  ReceiptItem,
  ReceivedInventory,
  StockItem,
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
];

export default {
  schema,
};
