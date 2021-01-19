import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';

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
