import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IProduct extends BaseModelInterface {
  name: string;
  sku: string;
  price: number;
  weight?: string;
  quantity?: number;
}

export const modelName = 'Product';

export class Product implements Partial<IProduct> {
  public static schema: Realm.ObjectSchema = {
    name: 'Product',
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      sku: 'string',
      price: 'double',
      quantity: {type: 'int', default: 0},
      weight: 'string?',
    },
  };
}
