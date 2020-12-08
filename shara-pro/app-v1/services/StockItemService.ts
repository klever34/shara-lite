import Realm, {UpdateMode} from 'realm';
import {IStockItem, modelName} from '../models/StockItem';
import {restockProduct} from './ProductService';

export const getStockItems = ({realm}: {realm: Realm}): IStockItem[] => {
  return (realm.objects<IStockItem>(modelName) as unknown) as IStockItem[];
};

export const addNewStockItem = ({
  realm,
  stockItem,
}: {
  realm: Realm;
  stockItem: IStockItem;
}): void => {
  realm.write(() => {
    realm.create<IStockItem>(modelName, stockItem, UpdateMode.Modified);
  });

  restockProduct({
    realm,
    product: stockItem.product,
    quantity: stockItem.quantity,
  });
};
