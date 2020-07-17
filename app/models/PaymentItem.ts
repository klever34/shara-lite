export interface IPaymentItem {
  id: string;
  description: string;
  product: object;
  payment: object;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export class PaymentItem implements Partial<IPaymentItem> {
  public static schema: Realm.ObjectSchema = {
    name: 'PaymentItem',
    primaryKey: 'id',
    properties: {
      id: 'string',
      description: 'string',
      payment: 'PaymentItem?',
      quantity: 'int',
      unit_price: 'double',
      total_price: 'double',
      created_at: 'date',
    },
  };
}
