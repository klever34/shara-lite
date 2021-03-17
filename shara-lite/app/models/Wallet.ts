import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IWallet extends BaseModelInterface {
  balance: number;
  currency_code: string;
  merchant_id: string;
  drawdown_amount_available: number;
  drawdown_amount_owed: number;
  is_drawdown_active: boolean;
  drawdown_repayment_date: Date;
  drawdown_transaction_fee_percentage: number;
}

export const modelName = 'Wallet';

export class Wallet extends BaseModel implements Partial<IWallet> {
  public static schema: Realm.ObjectSchema = {
    name: 'Wallet',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      balance: 'double?',
      currency_code: 'string?',
      merchant_id: 'string?',
      drawdown_amount_available: 'double?',
      drawdown_amount_owed: 'double?',
      is_drawdown_active: {type: 'bool', default: false, optional: true},
      drawdown_repayment_date: 'date?',
      drawdown_transaction_fee_percentage: 'double?',
    },
  };
}
