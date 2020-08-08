import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '../helpers/models';
import {InventoryStockItem} from '../../types/app';
import {IInventoryStock, modelName} from '../models/StockItem';
import {generateUniqueId} from '../helpers/utils';
import {restockProduct} from './ProductService';

export const getReceivedStocks = ({
  realm,
}: {
  realm: Realm;
}): IInventoryStock[] => {
  return (realm.objects<IInventoryStock>(
    modelName,
  ) as unknown) as IInventoryStock[];
};

export const addNewStocks = ({
  realm,
  stockItems,
  agent_full_name,
  agent_mobile,
}: {
  realm: Realm;
  stockItems: InventoryStockItem[];
  agent_full_name?: string;
  agent_mobile?: string;
}): void => {
  const batch_id = generateUniqueId();

  realm.write(() => {
    stockItems.forEach((stockItem) => {
      const newStockItem: IInventoryStock = {
        batch_id,
        agent_full_name: agent_full_name,
        agent_mobile: agent_mobile,
        supplier_name: stockItem.supplier.name,
        name: stockItem.product.name,
        sku: stockItem.product.sku,
        weight: stockItem.product.weight,
        quantity: parseInt(stockItem.quantity, 10),
        product: stockItem.product,
        supplier: stockItem.supplier,
        ...getBaseModelValues(),
      };

      realm.create<InventoryStockItem>(
        modelName,
        newStockItem,
        UpdateMode.Modified,
      );

      restockProduct({
        realm,
        product: newStockItem.product,
        quantity: newStockItem.quantity,
      });
    });
  });
};
