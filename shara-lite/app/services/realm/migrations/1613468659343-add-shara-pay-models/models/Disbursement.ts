import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IDisbursementMethod} from '@/services/realm/migrations/1613468659343-add-shara-pay-models/models/DisbursementMethod';

export interface IDisbursement extends BaseModelInterface {
  type: string;
  provider: string;
  amount: number;
  currency_code: string;
  reference: string;
  external_reference: string;
  external_id: string;
  status: string;
  meta: string;
  disbursement_method?: IDisbursementMethod;
}

export const modelName = 'Disbursement';

export class Disbursement extends BaseModel implements Partial<IDisbursement> {
  public static schema: Realm.ObjectSchema = {
    name: 'Disbursement',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      type: 'string?',
      provider: 'string?',
      amount: 'double?',
      currency_code: 'string?',
      reference: 'string?',
      external_reference: 'string?',
      external_id: 'string?',
      status: 'string?',
      meta: 'string?',
      api_id: 'int?',
      disbursement_method_id: 'int?',
      disbursement_method: 'DisbursementMethod?',
    },
  };
}
