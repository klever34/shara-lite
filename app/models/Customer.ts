export interface ICustomer {
  id: string;
  name: string;
  mobile: string;
  created_at: Date;
}

export class Customer implements Partial<ICustomer> {
  public static schema: Realm.ObjectSchema = {
    name: 'Customer',
    primaryKey: 'id',
    properties: {
      id: 'string',
      name: 'string',
      mobile: 'string',
      created_at: 'date',
    },
  };
}
