import Realm, {UpdateMode} from 'realm';
import {ISupplier, modelName} from '../models/Supplier';
import {getBaseModelValues} from '../helpers/models';

export const getSuppliers = ({realm}: {realm: Realm}): ISupplier[] => {
  return (realm.objects<ISupplier>(modelName) as unknown) as ISupplier[];
};

export const saveSupplier = ({
  realm,
  supplier,
}: {
  realm: Realm;
  supplier: ISupplier;
}): void => {
  const supplierDetails: ISupplier = {
    ...supplier,
    ...getBaseModelValues(),
  };

  realm.write(() => {
    realm.create<ISupplier>(modelName, supplierDetails, UpdateMode.Modified);
  });
};
