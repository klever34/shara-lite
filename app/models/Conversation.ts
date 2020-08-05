import {IMessage} from './Message';

export interface IConversation {
  channel: string;
  id: string;
  type: '1-1' | 'group';
  name: string;
  members: string[];
  lastMessage?: IMessage;

  // group chat
  admins?: string[];
  description?: string;
  creator?: string;
}

export class Conversation implements Partial<IConversation> {
  public static schema: Realm.ObjectSchema = {
    name: 'Conversation',
    primaryKey: 'channel',
    properties: {
      channel: 'string',
      type: 'string',
      lastMessage: 'Message?',
      admins: 'string?[]',
      members: 'string[]',
      name: 'string',
      description: 'string?',
      id: 'string',
      creator: 'string?',
    },
  };
}
