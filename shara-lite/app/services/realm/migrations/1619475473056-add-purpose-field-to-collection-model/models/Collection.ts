import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {ICustomer} from '@/services/realm/migrations/1611256639370-re-add-disable-customer-reminders/models/Customer';
import {ICollectionMethod} from '@/services/realm/migrations/1613546853297-add-is_primary_to_collection_disbursment_methods/models/CollectionMethod';

export interface ICollection extends BaseModelInterface {
  type: string;
  provider: string;
  amount: number;
  currency_code: string;
  reference: string;
  external_reference: string;
  external_id: string;
  status: string;
  meta: string;
  customer?: ICustomer;
  collection_method?: ICollectionMethod;
  provider_label?: string;
  purpose?: string;
}

export const modelName = 'Collection';

export class Collection extends BaseModel implements Partial<ICollection> {
  public static schema: Realm.ObjectSchema = {
    name: 'Collection',
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
      collection_method_id: 'int?',
      api_id: 'int?',
      customer: 'Customer?',
      collection_method: 'CollectionMethod?',
      provider_label: 'string?',
      purpose: 'string?',
    },
  };
}
