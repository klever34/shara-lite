import {ICustomer, modelName} from '../../models';
import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '@/helpers/models';
import {omit} from 'lodash';
import {ObjectId} from 'bson';

export const getCustomers = ({realm}: {realm: Realm}): ICustomer[] => {
  return (realm.objects<ICustomer>(modelName) as unknown) as ICustomer[];
};

export const saveCustomer = ({
  realm,
  customer,
}: {
  realm: Realm;
  customer: ICustomer;
}): ICustomer => {
  const customerDetails: ICustomer = {
    ...customer,
    name: customer.name,
    mobile: customer.mobile,
    ...getBaseModelValues(),
  };
  const existingCustomer = getCustomerByMobile({
    realm,
    mobile: customerDetails.mobile,
  });

  if (existingCustomer) {
    return existingCustomer;
  }

  realm.write(() => {
    realm.create<ICustomer>(modelName, customerDetails, UpdateMode.Modified);
  });

  return customerDetails;
};

export const updateCustomer = ({
  realm,
  customer,
  updates,
}: {
  realm: Realm;
  customer: ICustomer;
  updates: Partial<ICustomer>;
}) => {
  const updatedCustomer = {
    _id: customer._id,
    ...updates,
  };

  const updateCustomerInDb = () => {
    realm.create(modelName, updatedCustomer, UpdateMode.Modified);
  };

  if (realm.isInTransaction) {
    updateCustomerInDb();
  } else {
    realm.write(updateCustomerInDb);
  }
};

export const getCustomer = ({
  realm,
  customerId,
}: {
  realm: Realm;
  customerId: ObjectId;
}) => {
  // @ts-ignore
  return realm.objectForPrimaryKey(modelName, customerId) as ICustomer;
};

export const getCustomerByMobile = ({
  realm,
  mobile,
}: {
  realm: Realm;
  mobile?: string;
}): ICustomer | null => {
  const foundCustomers = realm
    .objects<ICustomer>(modelName)
    .filtered(`mobile = "${mobile}" LIMIT(1)`);
  return foundCustomers.length ? (omit(foundCustomers[0]) as ICustomer) : null;
};
