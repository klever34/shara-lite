import {IMessage} from './Message';

export interface IChat {
  channel: string;
  title: string;
  lastMessage?: IMessage;
  type: '1-1' | 'group';
  members: string[];
}

export class Chat implements Partial<IChat> {
  public static schema: Realm.ObjectSchema = {
    name: 'Chat',
    primaryKey: 'channel',
    properties: {
      channel: 'string',
      title: 'string',
      lastMessage: 'Message?',
      type: 'string',
      members: 'string[]',
    },
  };
}
