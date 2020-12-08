import {ICustomer} from './Customer';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IPayment} from './Payment';
import {IReceiptItem} from './ReceiptItem';
import {ICredit} from './Credit';

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
