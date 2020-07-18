import {IPayment} from './Payment';

export interface IPaymentItem {
  id: string;
  name: string;
  product?: object;
  payment: IPayment;
  quantity: number;
  price: number;
  total_price: number;
  created_at: Date;
}

export const modelName = 'PaymentItem';

export class PaymentItem implements Partial<IPaymentItem> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      payment: 'Payment?',
      quantity: 'int',
      price: 'double',
      total_price: 'double',
      created_at: 'date',
    },
  };
}
