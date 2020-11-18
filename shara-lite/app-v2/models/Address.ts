import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';
import {ICustomer} from 'app-v2/models/Customer';

export interface IAddress extends BaseModelInterface {
  text: string;
  coordinates: string;
  customer?: ICustomer;
}

export const modelName = 'Address';

export class Address extends BaseModel implements Partial<IAddress> {
  public static schema: Realm.ObjectSchema = {
    name: 'Address',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      text: 'string?',
      coordinates: 'string?',
      customer: 'Customer?',
    },
  };
}
