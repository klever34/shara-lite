import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {IInventoryStock} from './InventoryStock';

export interface IDeliveryAgent extends BaseModelInterface {
  full_name: string;
  mobile: string;
  suppliedInventories?: IInventoryStock[];
}

export const modelName = 'DeliveryAgent';

export class DeliveryAgent extends BaseModel
  implements Partial<IDeliveryAgent> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
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
