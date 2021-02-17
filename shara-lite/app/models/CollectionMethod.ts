import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {ICollection} from '@/models/Collection';

export type WovenAccountDetails = {
  vnuban: string;
  bank_name: string;
};

export interface ICollectionMethod extends BaseModelInterface {
  type: string;
  provider: string;
  external_id: string;
  account_details: string;
  country: string;
  country_iso_code: string;
  is_primary: boolean;
  collections?: Realm.Results<ICollection & Realm.Object>;
}

export const modelName = 'CollectionMethod';

export class CollectionMethod extends BaseModel
  implements Partial<ICollectionMethod> {
  public static schema: Realm.ObjectSchema = {
    name: 'CollectionMethod',
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
      collections: {
        type: 'linkingObjects',
        objectType: 'Collection',
        property: 'collection_method',
      },
    },
  };
}
