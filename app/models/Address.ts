import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IAddress extends BaseModelInterface {
  text: string;
  coordinates?: string;
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
