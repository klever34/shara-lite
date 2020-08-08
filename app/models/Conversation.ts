import {IMessage} from './Message';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export const modelName = 'Conversation';

export interface IConversation extends BaseModelInterface {
  channel: string;
  type: '1-1' | 'group';
  lastMessage?: IMessage;
  admins?: string[];
  members: string[];
  name: string;
  description?: string;
  id: string;
  creatorId?: string;
  creatorMobile?: string;
}

export class Conversation extends BaseModel implements Partial<IConversation> {
  public static schema: Realm.ObjectSchema = {
    name: 'Conversation',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      channel: 'string',
      type: 'string',
      lastMessage: 'Message?',
      admins: 'string[]',
      members: 'string[]',
      name: 'string',
      description: 'string?',
      id: 'string',
      creatorId: 'string?',
      creatorMobile: 'string?',
    },
  };
}
