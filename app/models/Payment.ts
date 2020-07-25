import {ICustomer} from './Customer';

export interface IPayment {
  id: string;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  type: string;
  amount_paid: number;
  total_amount: number;
  tax: number;
  credit_amount: number;
  created_at: Date;
}

export const modelName = 'Payment';

export class Payment implements Partial<IPayment> {
  public static schema: Realm.ObjectSchema = {
    name: 'Payment',
    primaryKey: 'id',
    properties: {
      id: 'string',
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      type: 'string',
      amount_paid: 'double',
      total_amount: 'double',
      tax: 'double',
      credit_amount: 'double',
      created_at: 'date',
    },
  };
}
