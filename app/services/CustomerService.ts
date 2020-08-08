import {Customer, ICustomer, modelName} from '../models/Customer';
import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '../helpers/models';

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
  const customerDetails: ICustomer = {
    ...customer,
    ...getBaseModelValues(),
  };

  realm.write(() => {
    realm.create<Customer>(modelName, customerDetails, UpdateMode.Modified);
  });
};
