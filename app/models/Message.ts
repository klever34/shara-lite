export interface IMessage {
  id: string;
  channel: string;
  created_at: Date;
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
      id: 'string',
      channel: 'string',
      created_at: 'date',
      content: 'string',
      author: 'string',
      sent_timetoken: 'string?',
      received_timetoken: 'string?',
      read_timetoken: 'string?',
    },
  };
}
