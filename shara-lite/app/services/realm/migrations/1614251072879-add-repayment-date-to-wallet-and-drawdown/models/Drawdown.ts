import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';

export interface IDrawdown extends BaseModelInterface {
  amount: number;
  repayment_amount: number;
  transaction_fee_percentage: number;
  transaction_fee_amount: number;
  penalty_fee_percentage: number;
  penalty_fee_amount: number;
  currency_code: string;
  reference: string;
  status: string;
  repayment_date: Date;
  approved_drawdown_id: number;
  api_id: number;
}

export const modelName = 'Drawdown';

export class Drawdown extends BaseModel implements Partial<IDrawdown> {
  public static schema: Realm.ObjectSchema = {
    name: 'Drawdown',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount: 'double?',
      repayment_amount: 'double?',
      transaction_fee_percentage: 'double?',
      transaction_fee_amount: 'double?',
      penalty_fee_percentage: 'double?',
      penalty_fee_amount: 'double?',
      currency_code: 'string?',
      reference: 'string?',
      status: 'string?',
      repayment_date: 'date?',
      approved_drawdown_id: 'int?',
      api_id: 'int?',
    },
  };
}
