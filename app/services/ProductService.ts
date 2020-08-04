import Realm, {UpdateMode} from 'realm';
import {IProduct, modelName} from '../models/Product';
import {getBaseModelValues} from '../helpers/models';

export const getProducts = ({realm}: {realm: Realm}): IProduct[] => {
  return (realm.objects<IProduct>(modelName) as unknown) as IProduct[];
};

export const saveProduct = ({
  realm,
  product,
}: {
  realm: Realm;
  product: IProduct;
}): IProduct => {
  const productToCreate: IProduct = {
    ...product,
    ...getBaseModelValues(),
  };

  realm.write(() => {
    realm.create<IProduct>(modelName, productToCreate, UpdateMode.Modified);
  });

  return productToCreate;
};

export const updateProduct = ({
  realm,
  product,
  updates,
}: {
  realm: Realm;
  product: IProduct;
  updates: Partial<IProduct>;
}) => {
  const updatedProduct = {
    id: product.id,
    ...updates,
  };

  realm.create<IProduct>(modelName, updatedProduct, UpdateMode.Modified);
};

export const restockProduct = ({
  realm,
  product,
  quantity,
}: {
  realm: Realm;
  product: IProduct;
  quantity: number;
}) => {
  const updates = {
    quantity: quantity + (product.quantity || 0),
  };

  updateProduct({
    realm,
    product,
    updates,
  });
};
