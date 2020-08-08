import {ISupplier} from './Supplier';
import {BaseModelInterface, baseModelSchema} from './baseSchema';
import {IStockItem} from './StockItem';

export interface IReceivedInventory extends BaseModelInterface {
  supplier_name: string;
  supplier: ISupplier;
  stockItems?: IStockItem[];
}

export const modelName = 'ReceivedInventory';

export class ReceivedInventory implements Partial<ReceivedInventory> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      batch_id: 'string',
      supplier_name: 'string',
      supplier: 'Supplier?',
      suppliedStockItems: {
        type: 'linkingObjects',
        objectType: 'StockItem',
        property: 'receivedInventory',
      },
    },
  };
}
