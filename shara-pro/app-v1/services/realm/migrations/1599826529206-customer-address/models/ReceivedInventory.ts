import {IDeliveryAgent} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/DeliveryAgent';
import {ISupplier} from 'app-v1/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Supplier';

import {
  BaseModelInterface,
  baseModelSchema,
} from 'app-v1/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';
import {IStockItem} from 'app-v1/services/realm/migrations/1599807779969-decimal-quantity/models/StockItem';

export interface IReceivedInventory extends BaseModelInterface {
  supplier_name: string;
  batch_id: string;
  total_amount: number;
  delivery_agent_full_name?: string;
  delivery_agent_mobile?: string;
  supplier: ISupplier;
  suppliedStockItems?: IStockItem[];
  delivery_agent?: IDeliveryAgent;
}

export const modelName = 'ReceivedInventory';

export class ReceivedInventory implements Partial<ReceivedInventory> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string?',
      supplier_name: 'string?',
      total_amount: 'double?',
      delivery_agent_full_name: 'string?',
      delivery_agent_mobile: 'string?',
      delivery_agent: 'DeliveryAgent?',
      supplier: 'Supplier?',
      suppliedStockItems: {
        type: 'linkingObjects',
        objectType: 'StockItem',
        property: 'receivedInventory',
      },
      coordinates: 'string?',
    },
  };
}
