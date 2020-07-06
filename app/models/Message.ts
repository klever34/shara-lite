export interface IMessage {
  id: string;
  channel: string;
  created_at: Date;
  content: string;
  author: string;
  timetoken?: string | number;
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
      timetoken: 'string?',
    },
  };
}
