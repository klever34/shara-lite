import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IInventoryStock} from './InventoryStock';

export interface ISupplier extends BaseModelInterface {
  name: string;
  mobile: string;
  address?: string;
  suppliedInventories?: IInventoryStock[];
}

export const modelName = 'Supplier';

export class Supplier extends BaseModel implements Partial<ISupplier> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      mobile: 'string?',
      address: 'string',
      suppliedInventories: {
        type: 'linkingObjects',
        objectType: 'InventoryStock',
        property: 'supplier',
      },
    },
  };
}
