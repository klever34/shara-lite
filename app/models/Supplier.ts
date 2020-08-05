import {BaseModelInterface, baseModelSchema} from './baseSchema';
import {InventoryStock} from './InventoryStock';

export interface ISupplier extends BaseModelInterface {
  name: string;
  suppliedInventories?: InventoryStock[];
}

export const modelName = 'Supplier';

export class Supplier implements Partial<ISupplier> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      suppliedInventories: {
        type: 'linkingObjects',
        objectType: 'InventoryStock',
        property: 'supplier',
      },
    },
  };
}
