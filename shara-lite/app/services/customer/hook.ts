import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import {omit} from 'lodash';
import perf from '@react-native-firebase/perf';
import {useRealm} from '@/services/realm';
import {ICustomer, modelName} from '@/models';
import {getBaseModelValues} from '@/helpers/models';
import {getAnalyticsService} from '@/services';
import {SharaAppEventsProperties} from '@/services/analytics';

interface saveCustomerInterface {
  customer: ICustomer;
  source: SharaAppEventsProperties['customerAdded']['source'];
}

interface updateCustomerInterface {
  customer: ICustomer;
  updates: Partial<ICustomer>;
}

interface getCustomerInterface {
  customerId: ObjectId;
}

interface deleteCustomerInterface {
  customer: ICustomer;
}

interface useCustomerInterface {
  getCustomers: () => ICustomer[];
  saveCustomer: (data: saveCustomerInterface) => Promise<ICustomer>;
  getCustomer: (data: getCustomerInterface) => ICustomer;
  updateCustomer: (data: updateCustomerInterface) => Promise<void>;
  deleteCustomer: (data: deleteCustomerInterface) => Promise<void>;
}

export const useCustomer = (): useCustomerInterface => {
  const realm = useRealm();

  const getCustomers = (): ICustomer[] => {
    return (realm
      .objects<ICustomer>(modelName)
      .filtered('is_deleted != true') as unknown) as ICustomer[];
  };

  const saveCustomer = async ({
    customer,
    source,
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
      .logEvent('customerAdded', {source})
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

  const updateCustomer = async ({
    customer,
    updates,
  }: updateCustomerInterface) => {
    const updatedCustomer = {
      _id: customer._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updatedCustomer');
    realm.write(() => {
      realm.create(modelName, updatedCustomer, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deleteCustomer = async ({customer}: deleteCustomerInterface) => {
    await updateCustomer({
      updates: {
        is_deleted: true,
      },
      customer,
    });
  };

  return {
    getCustomers,
    saveCustomer,
    getCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
