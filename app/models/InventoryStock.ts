import {IProduct} from './Product';
import {ISupplier} from './Supplier';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface InventoryStock extends BaseModelInterface {
  batch_id: string;
  name: string;
  sku: string;
  weight?: string;
  quantity: number;
  cost_price?: number;
  total_cost_price?: number;
  supplier: ISupplier;
  product: IProduct;
}

export const modelName = 'InventoryStock';

export class InventoryStock implements Partial<InventoryStock> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string',
      name: 'string',
      sku: 'string',
      quantity: 'int',
      price: 'double',
      cost_price: 'double?',
      total_cost_price: 'double?',
      weight: 'string?',
      supplier: 'Supplier?',
      product: 'Product?',
    },
  };
}
