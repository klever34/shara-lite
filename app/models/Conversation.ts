import {IMessage} from './Message';

export interface IConversation {
  channel: string;
  type: '1-1' | 'group';
  lastMessage?: IMessage;
  members: string[];
  name: string;
  description?: string;
  id?: string;
  creatorId?: string;
  creatorMobile?: string;
}

export class Conversation implements Partial<IConversation> {
  public static schema: Realm.ObjectSchema = {
    name: 'Conversation',
    primaryKey: 'channel',
    properties: {
      channel: 'string',
      type: 'string',
      lastMessage: 'Message?',
      name: 'string',
      id: 'string?',
      creatorId: 'string?',
      creatorMobile: 'string?',
      description: 'string?',
      members: 'string[]',
    },
  };
}
