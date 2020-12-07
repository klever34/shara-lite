import {IProduct} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Product';
import {ISupplier} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';
import {IReceivedInventory} from '@/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/ReceivedInventory';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

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

export class StockItem extends BaseModel implements Partial<StockItem> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string?',
      supplier_name: 'string?',
      name: 'string?',
      sku: 'string?',
      quantity: 'double?',
      cost_price: 'double?',
      total_cost_price: 'double?',
      weight: 'string?',
      supplier: 'Supplier?',
      product: 'Product?',
      receivedInventory: 'ReceivedInventory?',
    },
  };
}
