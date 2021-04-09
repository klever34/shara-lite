import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IDrawdownRepayment extends BaseModelInterface {
  amount: number;
  currency_code: string;
  reference: string;
  status: string;
  app_id: number;
  approved_drawdown_id?: number;
}

export const modelName = 'DrawdownRepayment';

export class DrawdownRepayment extends BaseModel implements Partial<IDrawdownRepayment> {
  public static schema: Realm.ObjectSchema = {
    name: 'DrawdownRepayment',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      amount: 'double?',
      currency_code: 'string?',
      reference: 'string?',
      status: 'string?',
      api_id: 'int?',
      approved_drawdown_id: 'int?',
    },
  };
}
