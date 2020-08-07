import {ObjectId} from 'bson';
import {IProduct} from './Product';
import {ISupplier} from './Supplier';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {DeliveryAgent} from './DeliveryAgent';
import {getAuthService} from '../services';

const authService = getAuthService();

export interface IInventoryStock extends BaseModelInterface {
  supplier_name: string;
  batch_id: string;
  name: string;
  sku: string;
  weight?: string;
  quantity: number;
  cost_price?: number;
  total_cost_price?: number;
  delivery_agent_full_name?: string;
  delivery_agent_mobile?: string;
  supplier: ISupplier;
  product: IProduct;
  delivery_agent?: DeliveryAgent;
}

export const modelName = 'InventoryStock';

export class InventoryStock extends BaseModel
  implements Partial<InventoryStock> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string',
      name: 'string',
      sku: 'string',
      quantity: 'int',
      cost_price: 'double?',
      total_cost_price: 'double?',
      weight: 'string?',
      delivery_agent_full_name: 'string?',
      delivery_agent_mobile: 'string?',
      supplier: 'Supplier?',
      product: 'Product?',
      delivery_agent: 'DeliveryAgent?',
    },
  };
}
