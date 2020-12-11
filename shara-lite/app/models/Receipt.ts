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
  note?: string;
  is_hidden_in_pro?: boolean;

  //Getters
  isPaid?: boolean;
  hasCustomer?: boolean;
  dueDate?: Date;
  isPending?: boolean;
  isYouGot?: boolean;
  isYouGave?: boolean;
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
      is_hidden_in_pro: {type: 'bool', default: false, optional: true},
      note: 'string?',
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
  public payments: IPayment[] | undefined;
  public local_image_url: IReceipt['local_image_url'];
  public image_url: IReceipt['image_url'];
  public items: IReceipt['items'];

  public get hasCustomer() {
    return !!this?.customer?._id;
  }

  public get dueDate() {
    return this.credits && this?.credits[0] && this?.credits[0].due_date;
  }

  public get isPending() {
    return !!(this.local_image_url || this.image_url) && !this.items?.length;
  }

  public get isPaid() {
    return !this.credits?.filter((credit) => !credit.fulfilled).length;
  }

  public get isYouGave() {
    return !!(this.credits && this.credits.length);
  }

  public get isYouGot() {
    return !this.isYouGave;
  }
}
