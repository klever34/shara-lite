import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IProduct extends BaseModelInterface {
  name: string;
  sku?: string;
  price?: number;
  weight?: string;
  quantity?: number;
}

export const modelName = 'Product';

export class Product extends BaseModel implements Partial<IProduct> {
  public static schema: Realm.ObjectSchema = {
    name: 'Product',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string?',
      sku: 'string?',
      price: 'double?',
      quantity: {type: 'double', default: 0, optional: true},
      weight: 'string?',
    },
  };
}
