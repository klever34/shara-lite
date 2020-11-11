import Realm, {UpdateMode} from 'realm';
import {IProduct, modelName} from '../models/Product';
import {getBaseModelValues} from '../helpers/models';

export const getProducts = ({realm}: {realm: Realm}): IProduct[] => {
  return (realm
    .objects<IProduct>(modelName)
    .filtered('is_deleted = false') as unknown) as IProduct[];
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

export const saveProducts = ({
  realm,
  products,
}: {
  realm: Realm;
  products: IProduct[];
}): void => {
  products.forEach((product: IProduct) => {
    saveProduct({
      realm,
      product,
    });
  });
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
    _id: product._id,
    ...updates,
    updated_at: new Date(),
  };

  const updateProductInDb = () => {
    realm.create(modelName, updatedProduct, UpdateMode.Modified);
  };

  if (realm.isInTransaction) {
    updateProductInDb();
  } else {
    realm.write(updateProductInDb);
  }
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
  let updatedQuantity = quantity + (product.quantity || 0);
  updatedQuantity = updatedQuantity < 0 ? 0 : updatedQuantity;
  const updates = {
    quantity: updatedQuantity,
  };

  updateProduct({
    realm,
    product,
    updates,
  });
};

export const getProduct = ({
  realm,
  productId,
}: {
  realm: Realm;
  productId: string;
}) => {
  return realm.objectForPrimaryKey(modelName, productId) as IProduct;
};

export const deleteProduct = ({
  realm,
  product,
}: {
  realm: Realm;
  product: IProduct;
}) => {
  realm.write(() => {
    realm.delete(product);
  });
};
