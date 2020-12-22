import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {ICustomer} from '@/services/realm/migrations/1608634902886-add-payment-reminder/models/Customer';

enum ReminderUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

enum ReminderWhen {
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
