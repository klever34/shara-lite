import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '../helpers/models';
import {InventoryStockItem} from '../../types/app';
import {IStockItem} from '../models/StockItem';
import {IReceivedInventory, modelName} from '../models/ReceivedInventory';
import {generateUniqueId} from '../helpers/utils';
import {restockProduct} from './ProductService';

export const getReceivedInventories = ({
  realm,
}: {
  realm: Realm;
}): IReceivedInventory[] => {
  return (realm.objects<IReceivedInventory>(
    modelName,
  ) as unknown) as IReceivedInventory[];
};

export const addNewInventory = ({
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
      const newStockItem: IReceivedInventory = {
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
