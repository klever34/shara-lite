import {UpdateMode} from 'realm';
import {omit} from 'lodash';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {ISupplier, modelName} from '@/models/Supplier';
import {getAnalyticsService} from '@/services';
import perf from '@react-native-firebase/perf';

interface saveSupplierInterface {
  supplier: ISupplier;
}

interface useSupplierInterface {
  getSuppliers: () => ISupplier[];
  saveSupplier: (data: saveSupplierInterface) => Promise<ISupplier>;
}

export const useSupplier = (): useSupplierInterface => {
  const realm = useRealm();

  const getSuppliers = (): ISupplier[] => {
    return (realm
      .objects<ISupplier>(modelName)
      .filtered('is_deleted = false') as unknown) as ISupplier[];
  };

  const getSupplierByMobile = ({
    mobile,
  }: {
    mobile?: string;
  }): ISupplier | null => {
    const foundSuppliers = realm
      .objects<ISupplier>(modelName)
      .filtered(`mobile = "${mobile}" LIMIT(1)`);
    return foundSuppliers.length
      ? (omit(foundSuppliers[0]) as ISupplier)
      : null;
  };

  const saveSupplier = async ({
    supplier,
  }: {
    supplier: ISupplier;
  }): Promise<ISupplier> => {
    const supplierDetails: ISupplier = {
      ...supplier,
      ...getBaseModelValues(),
    };
    const existingSupplier = getSupplierByMobile({
      mobile: supplier.mobile,
    });

    if (existingSupplier) {
      return existingSupplier;
    }

    const trace = await perf().startTrace('saveSupplier');
    realm.write(() => {
      realm.create<ISupplier>(modelName, supplierDetails, UpdateMode.Modified);
    });
    await trace.stop();

    getAnalyticsService()
      .logEvent('supplierAdded', {})
      .then(() => {});

    return supplierDetails;
  };

  return {
    getSuppliers,
    saveSupplier,
  };
};
