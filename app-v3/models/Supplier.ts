import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IStockItem} from './StockItem';
import {IReceivedInventory} from './ReceivedInventory';

export interface ISupplier extends BaseModelInterface {
  name: string;
  mobile?: string;
  address?: string;
  suppliedInventories?: IReceivedInventory[];
  suppliedStockItems?: IStockItem[];
}

export const modelName = 'Supplier';

export class Supplier extends BaseModel implements Partial<ISupplier> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string?',
      mobile: 'string?',
      address: 'string?',
      suppliedInventories: {
        type: 'linkingObjects',
        objectType: 'StockItem',
        property: 'supplier',
      },
      suppliedStockItems: {
        type: 'linkingObjects',
        objectType: 'StockItem',
        property: 'supplier',
      },
    },
  };
}
