import {ICustomer} from './Customer';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IReceipt extends BaseModelInterface {
  id: string;
  amount_paid: number;
  tax: number;
  total_amount: number;
  credit_amount: number;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  created_at?: Date;
  updated_at?: Date;
}

export const modelName = 'Receipt';

export class Receipt implements Partial<IReceipt> {
  public static schema: Realm.ObjectSchema = {
    name: 'Receipt',
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      amount_paid: 'double',
      tax: 'double',
      total_amount: 'double',
      credit_amount: 'double',
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      payments: {
        type: 'linkingObjects',
        objectType: 'Payment',
        property: 'receipt',
      },
      items: {
        type: 'linkingObjects',
        objectType: 'ReceiptItem',
        property: 'receipt',
      },
    },
  };
}
