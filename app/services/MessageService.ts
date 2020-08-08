import Realm from 'realm';
import {IMessage} from '../models';
import {omit} from 'lodash';

const modelName = 'Message';

export const getMessageByPubnubId = ({
  realm,
  messageId,
}: {
  realm: Realm;
  messageId: string;
}): IMessage | null => {
  const foundMessages = realm
    .objects<IMessage>(modelName)
    .filtered(`id = "${messageId}" LIMIT(1)`);
  return foundMessages.length ? (omit(foundMessages[0]) as IMessage) : null;
};

export const getMessage = ({
  realm,
  messageId,
}: {
  realm: Realm;
  messageId: string;
}) => {
  return realm.objectForPrimaryKey(modelName, messageId) as IMessage;
};
