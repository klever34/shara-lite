export interface IConversation {
  channel: string;
  title: string;
}

export class Conversation implements Partial<IConversation> {
  public static schema: Realm.ObjectSchema = {
    name: 'Conversation',
    primaryKey: 'channel',
    properties: {
      channel: 'string',
      title: 'string',
    },
  };
}
