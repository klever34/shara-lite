import {BaseModelInterface, baseModelSchema} from './baseSchema';
import {IInventoryStock} from './InventoryStock';

export interface IDeliveryAgent extends BaseModelInterface {
  full_name: string;
  mobile: string;
  suppliedInventories?: IInventoryStock[];
}

export const modelName = 'DeliveryAgent';

export class DeliveryAgent implements Partial<IDeliveryAgent> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      full_name: 'string',
      mobile: 'string',
      suppliedInventories: {
        type: 'linkingObjects',
        objectType: 'InventoryStock',
        property: 'delivery_agent',
      },
    },
  };
}
