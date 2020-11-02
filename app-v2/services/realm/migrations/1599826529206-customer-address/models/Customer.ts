import {IPayment} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {IReceipt} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Receipt';
import {ICredit} from 'app-v2/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from 'app-v2/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';

export interface ICustomer extends BaseModelInterface {
  name: string;
  mobile?: string;
  receipts?: IReceipt[];
  payments?: IPayment[];
  credits?: ICredit[];
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
