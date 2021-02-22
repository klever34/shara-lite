import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IDisbursement} from '@/models/Disbursement';

export interface IDisbursementMethod extends BaseModelInterface {
  type: string;
  provider: string;
  external_id: string;
  account_details: string;
  country: string;
  country_iso_code: string;
  api_id: number;
  is_primary: boolean;
  disbursements?: Realm.Results<IDisbursement & Realm.Object>;

  //Getters
  parsedAccountDetails: {bank_name: string; nuban: string};
}

export type DisbursementOption = {
  name: string;
  slug: string;
  is_primary: boolean;
  fieldsData: Array<{
    key: string;
    label: string;
    value:
      | string
      | {
          label: string;
          value: string;
        };
    required: string;
    type: string;
    options: Array<{
      label: string;
      value: string;
    }>;
  }>;
};

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
  public account_details: string | undefined;

  public get parsedAccountDetails() {
    try {
      const account_details = JSON.parse(
        JSON.parse(this.account_details ?? ''),
      );
      return {
        bank_name: JSON.parse(account_details[0].value).label,
        nuban: account_details[2].value,
      };
    } catch (e) {
      return {bank_name: '', nuban: ''};
    }
  }
}
