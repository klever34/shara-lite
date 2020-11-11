import {IPayment} from './Payment';
import {IReceipt} from './Receipt';
import {ICredit} from './Credit';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IAddress} from '@/models/Address';

export enum DEBT_LEVEL {
  NO_DEBT = 0,
  IN_DEBT = 1,
  OVERDUE = 2,
}

export interface ICustomer extends BaseModelInterface {
  name: string;
  mobile?: string;
  email?: string;
  receipts?: Realm.Results<IReceipt & Realm.Object>;
  payments?: IPayment[];
  credits?: Realm.Results<ICredit & Realm.Object>;
  addresses?: IAddress[];

  // Getters
  totalAmount?: number;
  overdueCredit?: Realm.Results<ICredit & Realm.Object>;
  overdueCreditAmount?: number;
  remainingCredit?: Realm.Results<ICredit & Realm.Object>;
  remainingCreditAmount?: number;
  debtLevel?: DEBT_LEVEL;
}

export const modelName = 'Customer';

export class Customer extends BaseModel implements Partial<ICustomer> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string?',
      mobile: {type: 'string?', indexed: true},
      email: 'string?',
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
  public receipts: Realm.Results<IReceipt & Realm.Object> | undefined;
  public credits: Realm.Results<ICredit & Realm.Object> | undefined;

  public get totalAmount() {
    return (
      this.receipts?.reduce((acc, receipt) => acc + receipt.total_amount, 0) ??
      0
    );
  }

  public get remainingCredit() {
    return this.credits?.filtered('amount_left > 0');
  }

  public get remainingCreditAmount() {
    return this.remainingCredit?.reduce(
      (acc, item) => acc + item.amount_left,
      0,
    );
  }

  public get overdueCredit() {
    const today = new Date();
    return this.credits?.filtered(
      'fulfilled = false AND due_date != null AND due_date < $0',
      today.toISOString(),
    );
  }

  public get overdueCreditAmount() {
    return this.overdueCredit?.reduce(
      (total, {amount_left}) => total + amount_left,
      0,
    );
  }

  public get debtLevel() {
    if (this.overdueCreditAmount) {
      return DEBT_LEVEL.OVERDUE;
    }
    if (this.remainingCreditAmount) {
      return DEBT_LEVEL.IN_DEBT;
    }
    return DEBT_LEVEL.NO_DEBT;
  }
}
