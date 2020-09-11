import {IPayment} from './Payment';
import {IReceipt} from './Receipt';
import {ICredit} from './Credit';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IAddress} from '@/models/Address';

export interface ICustomer extends BaseModelInterface {
  name: string;
  mobile?: string;
  receipts?: IReceipt[];
  payments?: IPayment[];
  credits?: ICredit[];
  addresses?: IAddress[];
}

export const modelName = 'Customer';

export class Customer extends BaseModel implements Partial<ICustomer> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string?',
      mobile: 'string?',
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
      addresses: {
        type: 'linkingObjects',
        objectType: 'Address',
        property: 'customer',
      },
    },
  };
}
