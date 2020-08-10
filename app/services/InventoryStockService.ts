import Realm, {UpdateMode} from 'realm';
import {getBaseModelValues} from '../helpers/models';
import {InventoryStockItem} from '../../types/app';
import {IInventoryStock, modelName} from '../models/InventoryStock';
import {generateUniqueId} from '../helpers/utils';
import {restockProduct} from './ProductService';
import {IDeliveryAgent} from '../models/DeliveryAgent';
import {saveDeliveryAgent} from './DeliveryAgentService';
import {getAnalyticsService} from './index';

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
  delivery_agent,
}: {
  realm: Realm;
  stockItems: InventoryStockItem[];
  delivery_agent?: IDeliveryAgent;
}): void => {
  const batch_id = generateUniqueId();
  let savedDeliveryAgent: IDeliveryAgent;

  realm.write(() => {
    if (delivery_agent) {
      savedDeliveryAgent = delivery_agent.id
        ? saveDeliveryAgent({realm, delivery_agent})
        : delivery_agent;
      getAnalyticsService().logEvent('deliveryAgentAdded').then();
    }

    stockItems.forEach((stockItem) => {
      const newStockItem: IInventoryStock = {
        batch_id,
        supplier_name: stockItem.supplier.name,
        name: stockItem.product.name,
        sku: stockItem.product.sku,
        weight: stockItem.product.weight,
        quantity: parseInt(stockItem.quantity, 10),
        product: stockItem.product,
        supplier: stockItem.supplier,
        ...getBaseModelValues(),
      };

      if (savedDeliveryAgent) {
        newStockItem.delivery_agent = savedDeliveryAgent;
        newStockItem.delivery_agent_full_name = savedDeliveryAgent.full_name;
        newStockItem.delivery_agent_mobile = savedDeliveryAgent.mobile;
      }

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
