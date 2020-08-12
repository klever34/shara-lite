import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '../helpers/models';
import {generateUniqueId} from '../helpers/utils';
import {IDeliveryAgent} from '../models/DeliveryAgent';
import {
  IReceivedInventory,
  modelName,
  ReceivedInventory,
} from '../models/ReceivedInventory';
import {IStockItem} from '../models/StockItem';
import {ISupplier} from '../models/Supplier';
import {saveDeliveryAgent} from './DeliveryAgentService';
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
  stockItems: IStockItem[];
}): void => {
  const batch_id = generateUniqueId();
  const total_amount = stockItems.reduce(
    (total, stockItem) =>
      total + (stockItem.cost_price || 0) * stockItem.quantity,
    0,
  );
  const receivedInventory: IReceivedInventory = {
    batch_id,
    total_amount,
    suppliedStockItems: stockItems,
    supplier_name: supplier.name,
    supplier: supplier,
    ...getBaseModelValues(),
  };

  let savedDeliveryAgent: IDeliveryAgent;
  if (delivery_agent) {
    savedDeliveryAgent = delivery_agent._id
      ? delivery_agent
      : saveDeliveryAgent({realm, delivery_agent});
  }

  // @ts-ignore
  if (savedDeliveryAgent) {
    receivedInventory.delivery_agent = savedDeliveryAgent;
    receivedInventory.delivery_agent_full_name = savedDeliveryAgent.full_name;
    receivedInventory.delivery_agent_mobile = savedDeliveryAgent.mobile;
  }

  realm.write(() => {
    realm.create<ReceivedInventory>(
      modelName,
      receivedInventory,
      UpdateMode.Modified,
    );
  });

  stockItems.forEach((stockItem) => {
    const quantity = stockItem.quantity;
    const cost_price = stockItem.cost_price || 0;
    const total_cost_price = quantity * cost_price;

    const newStockItem: IStockItem = {
      batch_id,
      supplier_name: supplier.name,
      cost_price,
      quantity,
      total_cost_price,
      name: stockItem.product.name,
      sku: stockItem.product.sku,
      weight: stockItem.product.weight,
      product: stockItem.product,
      supplier,
      receivedInventory,
      ...getBaseModelValues(),
    };

    addNewStockItem({realm, stockItem: newStockItem});
  });
};