import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export enum ActivityTypes {
  REMINDER = 'reminder',
}

export interface IActivity extends BaseModelInterface {
  type: ActivityTypes;
  message: string;
  data: string;
  note?: string;
}

export const modelName = 'Activity';

export class Activity extends BaseModel implements Partial<IActivity> {
  public static schema: Realm.ObjectSchema = {
    name: 'Activity',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      type: 'string?',
      message: 'string?',
      data: 'string?',
      note: 'string?',
    },
  };
}
