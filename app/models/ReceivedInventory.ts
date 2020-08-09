import {ISupplier} from './Supplier';
import {BaseModelInterface, baseModelSchema} from './baseSchema';
import {IStockItem} from './StockItem';
import {IDeliveryAgent} from './DeliveryAgent';

export interface IReceivedInventory extends BaseModelInterface {
  supplier_name: string;
  batch_id: string;
  delivery_agent_full_name?: string;
  delivery_agent_mobile?: string;
  supplier: ISupplier;
  stockItems?: IStockItem[];
  delivery_agent?: IDeliveryAgent;
}

export const modelName = 'ReceivedInventory';

export class ReceivedInventory implements Partial<ReceivedInventory> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string',
      supplier_name: 'string',
      delivery_agent_full_name: 'string?',
      delivery_agent_mobile: 'string?',
      delivery_agent: 'DeliveryAgent?',
      supplier: 'Supplier?',
      suppliedStockItems: {
        type: 'linkingObjects',
        objectType: 'StockItem',
        property: 'receivedInventory',
      },
    },
  };
}
