import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface ILastSeen extends BaseModelInterface {
  date: Date;
}

export const modelName = 'LastSeen';

export class LastSeen extends BaseModel implements Partial<ILastSeen> {
  public static schema: Realm.ObjectSchema = {
    name: 'LastSeen',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      date: 'date?',
    },
  };
}
