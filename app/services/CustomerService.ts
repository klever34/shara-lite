import {ICustomer, modelName} from '../models';
import Realm, {Results, UpdateMode} from 'realm';

export const getCustomers = ({realm}: {realm: Realm}): Results<ICustomer> => {
  return realm.objects<ICustomer>(modelName);
};

export const saveCustomer = ({
  realm,
  customer,
}: {
  realm: Realm;
  customer: ICustomer;
}): void => {
  realm.write(() => {
    realm.create<ICustomer>(modelName, customer, UpdateMode.Modified);
  });
};
