import {ICustomer, modelName} from '../../models';
import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '@/helpers/models';
import {omit} from 'lodash';
import {ObjectId} from 'bson';
import {getAnalyticsService} from '@/services';
import {SharaAppEventsProperties} from '../analytics';

export const getCustomers = ({realm}: {realm: Realm}) => {
  return realm.objects<ICustomer>(modelName).filtered('is_deleted = false');
};

export const saveCustomer = ({
  realm,
  customer,
  source,
}: {
  realm: Realm;
  customer: ICustomer;
  source: SharaAppEventsProperties['customerAdded']['source'];
}): ICustomer => {
  let customerDetails: ICustomer = {
    ...customer,
    name: customer.name,
    mobile: customer.mobile,
  };

  if (customer._id) {
    customerDetails._id = customer._id;
  } else {
    customerDetails = {
      ...customerDetails,
      ...getBaseModelValues(),
    };
  }

  realm.write(() => {
    realm.create<ICustomer>(modelName, customerDetails, UpdateMode.Modified);
  });
  if (!customer._id) {
    getAnalyticsService()
      .logEvent('customerAdded', {source})
      .then(() => {});
  }

  return customerDetails;
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
