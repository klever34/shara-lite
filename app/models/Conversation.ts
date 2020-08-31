import {IMessage} from './Message';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IConversation extends BaseModelInterface {
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

export class Conversation extends BaseModel implements Partial<IConversation> {
  public static schema: Realm.ObjectSchema = {
    name: Conversation.name,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      channel: 'string?',
      type: 'string?',
      lastMessage: 'Message?',
      admins: 'string[]',
      members: 'string[]',
      name: 'string?',
      description: 'string?',
      id: 'string?',
    },
  };
}
