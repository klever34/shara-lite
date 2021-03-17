import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';

export interface IWallet extends BaseModelInterface {
  balance: number;
  currency_code: string;
  merchant_id: string;
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
    },
  };
}
