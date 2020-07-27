import {ICustomer} from './Customer';
import {IReceipt} from './Receipt';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IPayment extends BaseModelInterface {
  amount_paid: number;
  type: string;
  method: string;
  note?: string;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  receipt: IReceipt;
}

export const modelName = 'Payment';

export class Payment implements Partial<IPayment> {
  public static schema: Realm.ObjectSchema = {
    name: 'Payment',
    primaryKey: 'id',
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
