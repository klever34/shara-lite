import {IPayment} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Payment';
import {IReceipt} from '@/services/realm/migrations/1603716195553-add-receipt-note-field/models/Receipt';
import {ICredit} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Credit';
import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IAddress} from '@/services/realm/migrations/1599826529206-customer-address/models/Address';
import {IPaymentReminder} from '@/services/realm/migrations/1608634902886-add-payment-reminder/models/PaymentReminder';

export enum DEBT_LEVEL {
  NO_DEBT = 0,
  IN_DEBT = 1,
  OVERDUE = 2,
}

export interface ICustomer extends BaseModelInterface {
  name: string;
  mobile?: string;
  email?: string;
  notes?: string;
  image?: string;
  disable_reminders?: boolean;
  due_date?: Date;
  receipts?: Realm.Results<IReceipt & Realm.Object>;
  activeReceipts?: Realm.Results<IReceipt & Realm.Object>;
  collections?: Realm.Results<IReceipt & Realm.Object>;
  payments?: IPayment[];
  credits?: Realm.Results<ICredit & Realm.Object>;
  activeCredits?: Realm.Results<ICredit & Realm.Object>;
  paymentReminders?: Realm.Results<IPaymentReminder & Realm.Object>;
  addresses?: IAddress[];

  // Getters
  totalAmount?: number;
  balance?: number;
  overdueCredit?: Realm.Results<ICredit & Realm.Object>;
  overdueCreditAmount?: number;
  remainingCredit?: Realm.Results<ICredit & Realm.Object>;
  remainingCreditAmount?: number;
  debtLevel?: DEBT_LEVEL;
  dueDate?: Date | undefined;
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
      is_deleted: {type: 'bool', default: false, optional: true},
      due_date: 'date?',
      notes: 'string?',
      image: 'string?',
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
      paymentReminders: {
        type: 'linkingObjects',
        objectType: 'PaymentReminder',
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
    return this.credits?.filtered('fulfilled = false AND amount_left > 0');
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

  public get balance() {
    const totalCreditAmount =
      this.receipts
        ?.filtered('is_deleted != true AND is_cancelled != true')
        .sum('credit_amount') || 0;
    const totalCollectedAmount =
      this.receipts
        ?.filtered(
          'is_deleted != true AND is_cancelled != true AND credit_amount = 0',
        )
        .sum('amount_paid') || 0;

    return totalCollectedAmount - totalCreditAmount;
  }

  public get activeReceipts() {
    return this.receipts?.filtered(
      'is_deleted != true AND is_cancelled != true',
    );
  }

  public get activeCredits() {
    return this.credits?.filtered('is_deleted != true');
  }

  public get collections() {
    return this.receipts?.filtered(
      'is_deleted != true AND is_cancelled != true AND is_collection = true',
    );
  }

  public get overdueCreditAmount() {
    return this.overdueCredit?.reduce(
      (total, {amount_left}) => total + amount_left,
      0,
    );
  }

  public get debtLevel() {
    if (this.balance < 0) {
      return DEBT_LEVEL.IN_DEBT;
    }
    return DEBT_LEVEL.NO_DEBT;
  }

  public get dueDate() {
    const credits = this.credits
      ?.filtered(
        'is_deleted != true AND due_date != null AND fulfilled = false',
      )
      .sorted('due_date');

    return credits?.length ? credits[0].due_date : undefined;
  }
}
