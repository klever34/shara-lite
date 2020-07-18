import {IPayment} from './Payment';

export interface ICustomer {
  id: string;
  name: string;
  mobile: string;
  created_at: Date;
  payments?: IPayment[];
}

export const modelName = 'Customer';

export class Customer implements Partial<ICustomer> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      mobile: 'string',
      created_at: 'date',
      payments: {
        type: 'linkingObjects',
        objectType: 'Payment',
        property: 'customer',
      },
    },
  };
}
