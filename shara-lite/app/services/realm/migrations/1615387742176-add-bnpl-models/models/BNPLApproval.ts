import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';

export interface IBNPLApproval extends BaseModelInterface {
  amount_limit?: number;
  amount_drawn?: number;
  amount_available?: number;
  amount_repaid?: number;
  amount_owed?: number;
  currency_code?: string;
  repayment_period?: number;
  repayment_period_unit?: string;
  repayment_profile?: string;
  interest_rate?: number;
  interest_rate_unit?: string;
  payment_frequency?: number;
  payment_frequency_unit?: string;
  arrangement_fee?: number;
  arrangement_fee_unit?: string;
  reference?: string;
  status?: string;
  completed_at?: Date;
  api_id?: number;
}

export const modelName = 'BNPLApproval';

export class BNPLApproval extends BaseModel implements Partial<IBNPLApproval> {
  public static schema: Realm.ObjectSchema = {
    name: 'BNPLApproval',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount_limit: 'double?',
      amount_drawn: 'double?',
      amount_available: 'double?',
      amount_repaid: 'double?',
      amount_owed: 'double?',
      currency_code: 'string?',
      repayment_period: 'double?',
      repayment_period_unit: 'string?',
      repayment_profile: 'string?',
      interest_rate: 'double?',
      interest_rate_unit: 'string?',
      payment_frequency: 'double?',
      payment_frequency_unit: 'string?',
      arrangement_fee: 'double?',
      arrangement_fee_unit: 'string?',
      reference: 'string?',
      status: 'string?',
      completed_at: 'date?',
      api_id: 'int?',
    },
  };
}
