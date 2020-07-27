import {ICustomer} from './Customer';
import {IReceipt} from './Receipt';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface ICredit extends BaseModelInterface {
  total_amount: number;
  amount_paid: number;
  amount_left: number;
  fulfilled?: boolean;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  receipt?: IReceipt;
}

export const modelName = 'Credit';

export class Credit implements Partial<ICredit> {
  public static schema: Realm.ObjectSchema = {
    name: 'Credit',
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      total_amount: 'double',
      amount_paid: 'double',
      amount_left: 'double',
      fulfilled: {type: 'boolean', default: new Date()},
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      receipt: 'Receipt?',
    },
  };
}
