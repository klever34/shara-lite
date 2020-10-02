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

  // Getters
  overdueCredit?: ICredit[];
  overdueCreditAmount?: number;
  remainingCredit?: ICredit[];
  remainingCreditAmount?: number;
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
  public credits: ICredit[] | undefined;
  public get overdueCredit() {
    const today = new Date();
    return (this.credits || []).filter(
      ({fulfilled, due_date}) =>
        !fulfilled && due_date && due_date.getTime() < today.getTime(),
    );
  }

  public get overdueCreditAmount() {
    return (this.overdueCredit || []).reduce(
      (total, {amount_left}) => total + amount_left,
      0,
    );
  }

  public get remainingCredit() {
    return (this.credits || []).filter((item) => item.amount_left > 0);
  }

  public get remainingCreditAmount() {
    return (this.remainingCredit || []).reduce(
      (acc, item) => acc + item.amount_left,
      0,
    );
  }
}
