import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IProduct extends BaseModelInterface {
  name: string;
  sku: string;
  price: number;
  weight?: string;
  quantity?: number;
  test?: string;
}

export const modelName = 'Product';

export class Product extends BaseModel implements Partial<IProduct> {
  public static schema: Realm.ObjectSchema = {
    name: 'Product',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      sku: 'string',
      price: 'double',
      test: 'string?',
      quantity: {type: 'int', default: 0},
      weight: 'string?',
    },
  };
}
