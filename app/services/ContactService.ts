import Realm from 'realm';
import {omit} from 'lodash';
import {IContact} from '../models/Contact';

const modelName = 'Contact';

export const getContactByMobile = ({
  realm,
  mobile,
}: {
  realm: Realm;
  mobile: string;
}): IContact | null => {
  const foundContacts = realm
    .objects<IContact>(modelName)
    .filtered(`mobile = "${mobile}" LIMIT(1)`);
  return foundContacts.length ? (omit(foundContacts[0]) as IContact) : null;
};

export const getContact = ({
  realm,
  contactId,
}: {
  realm: Realm;
  contactId: string;
}) => {
  return realm.objectForPrimaryKey(modelName, contactId) as IContact;
};