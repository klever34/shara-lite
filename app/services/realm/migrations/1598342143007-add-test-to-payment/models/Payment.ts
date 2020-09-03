import {ICustomer} from './Customer';
import {IReceipt} from './Receipt';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IPayment extends BaseModelInterface {
  amount_paid: number;
  type: string;
  method: string;
  note?: string;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  receipt?: IReceipt;
}

export const modelName = 'Payment';

export class Payment extends BaseModel implements Partial<IPayment> {
  public static schema: Realm.ObjectSchema = {
    name: 'Payment',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount_paid: 'double',
      type: 'string',
      method: 'string',
      note: 'string?',
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      receipt: 'Receipt?',
    },
  };
}
