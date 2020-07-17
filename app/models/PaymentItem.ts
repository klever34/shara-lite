export interface IPayment {
  id: string;
  description: string;
  product: object;
  payment: object;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export class Payment implements Partial<IPayment> {
  public static schema: Realm.ObjectSchema = {
    name: 'Payment',
    primaryKey: 'id',
    properties: {
      id: 'string',
      description: 'string',
      payment: 'Payment?',
      quantity: 'int',
      unit_price: 'double',
      total_price: 'double',
      created_at: 'date',
    },
  };
}
