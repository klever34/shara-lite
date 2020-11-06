import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import {omit} from 'lodash';
import {useRealm} from '@/services/realm';
import {ICustomer, modelName} from '@/models';
import {getBaseModelValues} from '@/helpers/models';
import {getAnalyticsService} from '@/services';
import perf from '@react-native-firebase/perf';

interface saveCustomerInterface {
  customer: ICustomer;
}

interface getCustomerInterface {
  customerId: ObjectId;
}

interface useCustomerInterface {
  getCustomers: () => ICustomer[];
  saveCustomer: (data: saveCustomerInterface) => Promise<ICustomer>;
  getCustomer: (data: getCustomerInterface) => ICustomer;
}

export const useCustomer = (): useCustomerInterface => {
  const realm = useRealm();

  const getCustomers = (): ICustomer[] => {
    return (realm
      .objects<ICustomer>(modelName)
      .filtered('is_deleted = false') as unknown) as ICustomer[];
  };

  const saveCustomer = async ({
    customer,
  }: saveCustomerInterface): Promise<ICustomer> => {
    const customerDetails: ICustomer = {
      ...customer,
      name: customer.name,
      mobile: customer.mobile,
      ...getBaseModelValues(),
    };
    const existingCustomer = getCustomerByMobile({
      mobile: customerDetails.mobile,
    });

    if (existingCustomer) {
      return existingCustomer;
    }

    const trace = await perf().startTrace('saveCustomer');
    realm.write(() => {
      realm.create<ICustomer>(modelName, customerDetails, UpdateMode.Modified);
    });
    await trace.stop();

    getAnalyticsService()
      .logEvent('customerAdded')
      .then(() => {});

    return customerDetails;
  };

  const getCustomer = ({customerId}: getCustomerInterface) => {
    // @ts-ignore
    return realm.objectForPrimaryKey(modelName, customerId) as ICustomer;
  };

  const getCustomerByMobile = ({
    mobile,
  }: {
    mobile?: string;
  }): ICustomer | null => {
    const foundCustomers = realm
      .objects<ICustomer>(modelName)
      .filtered(`mobile = "${mobile}" LIMIT(1)`);
    return foundCustomers.length
      ? (omit(foundCustomers[0]) as ICustomer)
      : null;
  };

  return {
    getCustomers,
    saveCustomer,
    getCustomer,
  };
};
