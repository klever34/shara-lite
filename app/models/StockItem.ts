import {IProduct} from './Product';
import {ISupplier} from './Supplier';
import {BaseModelInterface, baseModelSchema} from './baseSchema';
import {IReceivedInventory} from './ReceivedInventory';

export interface IStockItem extends BaseModelInterface {
  supplier_name: string;
  batch_id?: string;
  name: string;
  sku: string;
  weight?: string;
  quantity: number;
  cost_price?: number;
  total_cost_price?: number;
  supplier: ISupplier;
  product: IProduct;
  receivedInventory?: IReceivedInventory;
}

export const modelName = 'StockItem';

export class StockItem implements Partial<StockItem> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string?',
      supplier_name: 'string',
      name: 'string',
      sku: 'string',
      quantity: 'int',
      cost_price: 'double?',
      total_cost_price: 'double?',
      weight: 'string?',
      supplier: 'Supplier?',
      product: 'Product?',
      receivedInventory: 'ReceivedInventory?',
    },
  };
}
