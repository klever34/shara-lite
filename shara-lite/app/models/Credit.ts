import {ICustomer} from './Customer';
import {IReceipt} from './Receipt';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {ICreditPayment} from './CreditPayment';

export interface ICredit extends BaseModelInterface {
  total_amount: number;
  amount_paid: number;
  amount_left: number;
  fulfilled?: boolean;
  due_date?: Date;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  receipt?: IReceipt;
  payments?: Realm.Results<ICreditPayment & Realm.Object>;
}

export const modelName = 'Credit';

export class Credit extends BaseModel implements Partial<ICredit> {
  public static schema: Realm.ObjectSchema = {
    name: 'Credit',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      total_amount: 'double?',
      amount_paid: 'double?',
      amount_left: 'double?',
      due_date: 'date?',
      fulfilled: {type: 'bool', default: false, optional: true},
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      receipt: 'Receipt?',
      payments: {
        type: 'linkingObjects',
        objectType: 'CreditPayment',
        property: 'credit',
      },
    },
  };
}
