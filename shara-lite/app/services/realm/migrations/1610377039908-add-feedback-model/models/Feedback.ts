import {
  BaseModel,
  BaseModelInterface,
  baseModelSchema,
} from '@/services/realm/migrations/1599807779969-decimal-quantity/models/baseSchema';

export interface IFeedback extends BaseModelInterface {
  message: string;
}

export const modelName = 'Feedback';

export class Feedback extends BaseModel implements Partial<IFeedback> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      message: 'string?',
    },
  };
}
