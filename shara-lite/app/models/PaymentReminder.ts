import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {ICustomer} from '@/models/Customer';

export enum ReminderUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

export enum ReminderWhen {
  BEFORE = 'before',
  AFTER = 'after',
}

export interface IPaymentReminder extends BaseModelInterface {
  amount: number;
  unit: ReminderUnit;
  when: ReminderWhen;
  due_date?: Date;
  customer: ICustomer;
}

export const modelName = 'PaymentReminder';

export class PaymentReminder extends BaseModel
  implements Partial<IPaymentReminder> {
  public static schema: Realm.ObjectSchema = {
    name: 'PaymentReminder',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount: 'double?',
      unit: 'string?',
      when: 'string?',
      due_date: 'date?',
      customer: 'Customer?',
    },
  };
}
