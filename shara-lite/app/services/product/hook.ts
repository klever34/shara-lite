import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {IProduct, modelName} from '@/models/Product';
import perf from '@react-native-firebase/perf';

interface saveProductInterface {
  product: IProduct;
}

interface updateProductInterface {
  product: IProduct;
  updates: object;
}

interface restockProductInterface {
  product: IProduct;
  quantity: number;
}

interface getProductInterface {
  productId: string;
}

interface deleteProductInterface {
  product: IProduct;
}

interface useProductInterface {
  getProducts: () => IProduct[];
  saveProduct: (data: saveProductInterface) => Promise<IProduct>;
  updateProduct: (data: updateProductInterface) => void;
  restockProduct: (data: restockProductInterface) => void;
  getProduct: (params: getProductInterface) => void;
  deleteProduct: (data: deleteProductInterface) => void;
}

export const useProduct = (): useProductInterface => {
  const realm = useRealm();

  const getProducts = (): IProduct[] => {
    return (realm
      .objects<IProduct>(modelName)
      .filtered('is_deleted != true') as unknown) as IProduct[];
  };

  const saveProduct = async ({
    product,
  }: saveProductInterface): Promise<IProduct> => {
    const productToCreate: IProduct = {
      ...product,
      ...getBaseModelValues(),
    };

    const trace = await perf().startTrace('saveProduct');
    realm.write(() => {
      realm.create<IProduct>(modelName, productToCreate, UpdateMode.Modified);
    });
    await trace.stop();

    return productToCreate;
  };

  const updateProduct = async ({product, updates}: updateProductInterface) => {
    const updatedProduct = {
      _id: product._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updateProduct');
    realm.write(() => {
      realm.create(modelName, updatedProduct, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const restockProduct = async ({
    product,
    quantity,
  }: restockProductInterface) => {
    let updatedQuantity = quantity + (product.quantity || 0);
    updatedQuantity = updatedQuantity < 0 ? 0 : updatedQuantity;
    const updates = {
      quantity: updatedQuantity,
    };

    await updateProduct({
      product,
      updates,
    });
  };

  const getProduct = ({productId}: getProductInterface) => {
    return realm.objectForPrimaryKey(modelName, productId) as IProduct;
  };

  const deleteProduct = async ({product}: deleteProductInterface) => {
    await updateProduct({
      product,
      updates: {is_deleted: true},
    });
  };

  return {
    getProducts,
    saveProduct,
    updateProduct,
    restockProduct,
    getProduct,
    deleteProduct,
  };
};
