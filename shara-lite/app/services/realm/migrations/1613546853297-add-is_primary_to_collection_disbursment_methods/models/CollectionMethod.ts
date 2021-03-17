import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {ICollection} from '@/services/realm/migrations/1613468659343-add-shara-pay-models/models/Collection';

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
