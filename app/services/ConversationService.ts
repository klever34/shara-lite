import Realm from 'realm';
import {IConversation} from '../models';

const modelName = 'Conversation';

export const getConversationByChannel = ({
  realm,
  channel,
}: {
  realm: Realm;
  channel: string;
}): IConversation | null => {
  const foundConversations = realm
    .objects<IConversation>(modelName)
    .filtered(`channel = "${channel}" LIMIT(1)`);
  return foundConversations.length ? (foundConversations[0] as IConversation) : null;
};

export const getConversation = ({
  realm,
  conversationId,
}: {
  realm: Realm;
  conversationId: string;
}) => {
  return realm.objectForPrimaryKey(modelName, conversationId) as IConversation;
};
