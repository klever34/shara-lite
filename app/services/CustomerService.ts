import {ICustomer, modelName} from '../models';
import Realm, {UpdateMode} from 'realm';

export const getCustomers = ({realm}: {realm: Realm}): ICustomer[] => {
  return (realm.objects<ICustomer>(modelName) as unknown) as ICustomer[];
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
