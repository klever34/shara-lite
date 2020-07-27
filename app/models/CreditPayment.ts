import {ICredit} from './Credit';
import {IPayment} from './Payment';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface ICreditPayment extends BaseModelInterface {
  amount_paid: number;
  credit: ICredit;
  payment: IPayment;
}

export const modelName = 'CreditPayment';

export class CreditPayment implements Partial<ICreditPayment> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      amount_paid: 'double',
      credit: 'Credit?',
      payment: 'Payment?',
    },
  };
}
