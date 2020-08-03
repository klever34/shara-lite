import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IMessage extends BaseModelInterface {
  channel: string;
  content: string;
  author: string;
  timetoken?: string;
  delivered_timetoken?: string;
  read_timetoken?: string;
  created_at: Date;
}

export class Message implements Partial<IMessage> {
  public static schema: Realm.ObjectSchema = {
    name: 'Message',
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
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
