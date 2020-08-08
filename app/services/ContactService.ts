import Realm from 'realm';
import {IContact} from '../models';

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
  return foundContacts.length ? (foundContacts[0] as IContact) : null;
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
