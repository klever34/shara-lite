import {IPayment} from 'app-v3/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {ICredit} from 'app-v3/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';

import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from 'app-v3/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IReceiptItem} from 'app-v3/services/realm/migrations/1599807779969-decimal-quantity/models/ReceiptItem';
import {ICustomer} from 'app-v3/services/realm/migrations/1599826529206-customer-address/models/Customer';

export interface IReceipt extends BaseModelInterface {
  amount_paid: number;
  tax: number;
  total_amount: number;
  credit_amount: number;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  payments?: IPayment[];
  items?: IReceiptItem[];
  credits?: ICredit[];
  coordinates?: string;
  image_url?: string;
  local_image_url?: string;
  is_cancelled?: boolean;
  cancellation_reason?: string;
}

export const modelName = 'Receipt';

export class Receipt extends BaseModel implements Partial<IReceipt> {
  public static schema: Realm.ObjectSchema = {
    name: 'Receipt',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount_paid: 'double?',
      tax: 'double?',
      total_amount: 'double?',
      credit_amount: 'double?',
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      coordinates: 'string?',
      image_url: 'string?',
      local_image_url: 'string?',
      is_cancelled: {type: 'bool', default: false, optional: true},
      cancellation_reason: 'string?',
      items: {
        type: 'linkingObjects',
        objectType: 'ReceiptItem',
        property: 'receipt',
      },
      payments: {
        type: 'linkingObjects',
        objectType: 'Payment',
        property: 'receipt',
      },
      credits: {
        type: 'linkingObjects',
        objectType: 'Credit',
        property: 'receipt',
      },
    },
  };
}
