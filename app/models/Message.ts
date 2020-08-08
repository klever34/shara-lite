import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IMessage extends BaseModelInterface {
  id: string;
  channel: string;
  content: string;
  author: string;
  timetoken?: string;
  delivered_timetoken?: string;
  read_timetoken?: string;
  created_at: Date;
}

export class Message extends BaseModel implements Partial<IMessage> {
  public static schema: Realm.ObjectSchema = {
    name: 'Message',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      id: 'string',
      channel: 'string',
      content: 'string',
      author: 'string',
      timetoken: 'string?',
      delivered_timetoken: 'string?',
      read_timetoken: 'string?',
      created_at: 'date',
    },
  };
}
