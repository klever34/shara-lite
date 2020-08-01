import {IPayment} from './Payment';
import {IReceipt} from './Receipt';
import {ICredit} from './Credit';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface ICustomer extends BaseModelInterface {
  name: string;
  mobile: string;
  receipts?: IReceipt[];
  payments?: IPayment[];
  credits?: ICredit[];
}

export const modelName = 'Customer';

export class Customer implements Partial<ICustomer> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      mobile: 'string',
      receipts: {
        type: 'linkingObjects',
        objectType: 'Receipt',
        property: 'customer',
      },
      payments: {
        type: 'linkingObjects',
        objectType: 'Payment',
        property: 'customer',
      },
      credits: {
        type: 'linkingObjects',
        objectType: 'Credit',
        property: 'customer',
      },
    },
  };
}
