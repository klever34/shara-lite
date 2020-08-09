import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '../helpers/models';
import {InventoryStockItem} from '../../types/app';
import {IStockItem} from '../models/StockItem';
import {
  IReceivedInventory,
  modelName,
  ReceivedInventory,
} from '../models/ReceivedInventory';
import {generateUniqueId} from '../helpers/utils';
import {ISupplier} from '../models/Supplier';
import {saveDeliveryAgent} from './DeliveryAgentService';
import {IDeliveryAgent} from '../models/DeliveryAgent';
import {addNewStockItem} from './StockItemService';

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
  delivery_agent,
  supplier,
  stockItems,
}: {
  realm: Realm;
  delivery_agent?: IDeliveryAgent;
  supplier: ISupplier;
  stockItems: InventoryStockItem[];
}): void => {
  const batch_id = generateUniqueId();
  const receivedInventory: IReceivedInventory = {
    batch_id,
    supplier_name: supplier.name,
    supplier: supplier,
    ...getBaseModelValues(),
  };

  let savedDeliveryAgent: IDeliveryAgent;
  if (delivery_agent) {
    savedDeliveryAgent = delivery_agent._id
      ? saveDeliveryAgent({realm, delivery_agent})
      : delivery_agent;
  }

  // @ts-ignore
  if (savedDeliveryAgent) {
    receivedInventory.delivery_agent = savedDeliveryAgent;
    receivedInventory.delivery_agent_full_name = savedDeliveryAgent.full_name;
    receivedInventory.delivery_agent_mobile = savedDeliveryAgent.mobile;
  }

  realm.create<ReceivedInventory>(
    modelName,
    receivedInventory,
    UpdateMode.Modified,
  );

  stockItems.forEach((stockItem) => {
    const newStockItem: IStockItem = {
      batch_id,
      supplier_name: supplier.name,
      name: stockItem.product.name,
      sku: stockItem.product.sku,
      weight: stockItem.product.weight,
      quantity: parseInt(stockItem.quantity, 10),
      product: stockItem.product,
      supplier,
      receivedInventory,
      ...getBaseModelValues(),
    };

    addNewStockItem({realm, stockItem: newStockItem});
  });
};
