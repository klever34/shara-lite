import {ICustomer} from 'app-v3/models';
import {getContactService} from 'app-v3/services';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {getCustomers} from '../customer';
import {useRealm} from '../realm';

type Contact =
  | Pick<ICustomer, 'name' | 'mobile' | '_id'>
  | {
      name: string;
      mobile?: string;
    };

type ContactProviderValue = {
  contacts: Contact[];
};

const defaultValue = {
  contacts: [] as Contact[],
};

export const ContactsContext = createContext<{contacts: Contact[]}>(
  defaultValue,
);

export const useContacts = (): ContactProviderValue => {
  return useContext(ContactsContext);
};

const ContactsProvider = (props: any) => {
  const realm = useRealm() as Realm;
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = useCallback(async () => {
    const customers = getCustomers({realm});
    getContactService()
      .getPhoneContacts()
      .then((phoneContacts) => {
        const data = phoneContacts.reduce<Contact[]>(
          (acc, {givenName, familyName, phoneNumber}) => {
            const existing = customers.filtered(
              `mobile = "${phoneNumber.number}"`,
            );
            if (existing.length) {
              return acc;
            }
            return [
              ...acc,
              {
                name: `${givenName} ${familyName}`,
                mobile: phoneNumber.number,
              },
            ];
          },
          [],
        );

        setContacts(data);
      });
  }, [realm]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <ContactsContext.Provider value={{contacts}}>
      {props.children}
    </ContactsContext.Provider>
  );
};

export default ContactsProvider;
