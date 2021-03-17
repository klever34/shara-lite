import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IDisbursement} from '@/services/realm/migrations/1613468659343-add-shara-pay-models/models/Disbursement';

export interface IDisbursementMethod extends BaseModelInterface {
  type: string;
  provider: string;
  external_id: string;
  account_details: string;
  country: string;
  country_iso_code: string;
  is_primary: boolean;
  disbursements?: Realm.Results<IDisbursement & Realm.Object>;
}

export const modelName = 'DisbursementMethod';

export class DisbursementMethod extends BaseModel
  implements Partial<IDisbursementMethod> {
  public static schema: Realm.ObjectSchema = {
    name: 'DisbursementMethod',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      type: 'string?',
      provider: 'string?',
      external_id: 'string?',
      account_details: 'string?',
      country: 'string?',
      country_iso_code: 'string?',
      api_id: 'int?',
      is_primary: {type: 'bool', default: false, optional: true},
      disbursements: {
        type: 'linkingObjects',
        objectType: 'Disbursement',
        property: 'disbursement_method',
      },
    },
  };
}
