import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IMessage extends BaseModelInterface {
  channel: string;
  content: string;
  author: string;
  sent_timetoken?: string;
  received_timetoken?: string;
  read_timetoken?: string;
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
      sent_timetoken: 'string?',
      received_timetoken: 'string?',
      read_timetoken: 'string?',
      updated_at: 'date?',
    },
  };
}
