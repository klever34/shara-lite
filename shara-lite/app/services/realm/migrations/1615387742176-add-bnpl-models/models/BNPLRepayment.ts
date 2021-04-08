import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IBNPLDrawdown} from '@/services/realm/migrations/1615387742176-add-bnpl-models/models/BNPLDrawdown';

export interface IBNPLRepayment extends BaseModelInterface {
  amount_repaid?: number;
  amount_owed?: number;
  repayment_amount?: number;
  currency_code?: string;
  batch_no?: number;
  reference?: string;
  status?: string;
  due_at?: Date;
  completed_at?: Date;
  bnpl_drawdown?: IBNPLDrawdown;
  api_id?: number;
}

export const modelName = 'BNPLRepayment';

export class BNPLRepayment extends BaseModel
  implements Partial<IBNPLRepayment> {
  public static schema: Realm.ObjectSchema = {
    name: 'BNPLRepayment',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount_repaid: 'double?',
      amount_owed: 'double?',
      repayment_amount: 'double?',
      currency_code: 'string?',
      batch_no: 'int?',
      reference: 'string?',
      status: 'string?',
      due_at: 'date?',
      completed_at: 'date?',
      bnpl_drawdown: 'BNPLDrawdown?',
      api_id: 'int?',
    },
  };
}
