import {ICustomer} from './Customer';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IPayment} from './Payment';
import {IReceiptItem} from './ReceiptItem';
import {ICredit} from './Credit';

export interface IReceipt extends BaseModelInterface {
  amount_paid: number;
  tax: number;
  total_amount: number;
  credit_amount: number;
  customer_name?: string;
  customer_mobile?: string;
  customer?: ICustomer;
  payments?: IPayment[];
  items?: IReceiptItem[];
  credits?: ICredit[];
  coordinates?: string;
  image_url?: string;
  local_image_url?: string;
  is_cancelled?: boolean;
  cancellation_reason?: string;

  //Getters
  isPaid?: boolean;
  hasCustomer?: boolean;
  dueDate?: Date;
}

export const modelName = 'Receipt';

export class Receipt extends BaseModel implements Partial<IReceipt> {
  public static schema: Realm.ObjectSchema = {
    name: 'Receipt',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount_paid: 'double?',
      tax: 'double?',
      total_amount: 'double?',
      credit_amount: 'double?',
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      coordinates: 'string?',
      image_url: 'string?',
      local_image_url: 'string?',
      is_cancelled: {type: 'bool', default: false, optional: true},
      cancellation_reason: 'string?',
      items: {
        type: 'linkingObjects',
        objectType: 'ReceiptItem',
        property: 'receipt',
      },
      payments: {
        type: 'linkingObjects',
        objectType: 'Payment',
        property: 'receipt',
      },
      credits: {
        type: 'linkingObjects',
        objectType: 'Credit',
        property: 'receipt',
      },
    },
  };
  public total_amount: number | undefined;
  public amount_paid: number | undefined;
  public customer: ICustomer | undefined;
  public credits: ICredit[] | undefined;

  public get isPaid() {
    return this.total_amount === this.amount_paid;
  }

  public get hasCustomer() {
    return !!this?.customer?._id;
  }

  public get dueDate() {
    return this.credits && this?.credits[0] && this?.credits[0].due_date;
  }
}
