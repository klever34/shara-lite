import {UpdateMode} from 'realm';
import BluebirdPromise from 'bluebird';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {IReceivedInventory, modelName} from '@/models/ReceivedInventory';
import {generateUniqueId} from '@/helpers/utils';
import {IDeliveryAgent} from '@/models/DeliveryAgent';
import {ISupplier} from '@/models/Supplier';
import {IStockItem} from '@/models/StockItem';
import {getAnalyticsService, getGeolocationService} from '@/services';
import {convertToLocationString} from '@/services/geolocation';
import {useDeliveryAgent} from '@/services/delivery-agent';
import {useStockItem} from '@/services/stock-item';
import perf from '@react-native-firebase/perf';

interface addNewInventoryInterface {
  delivery_agent?: IDeliveryAgent;
  supplier: ISupplier;
  stockItems: IStockItem[];
}

interface useReceivedInventoryInterface {
  getReceivedInventories: () => IReceivedInventory[];
  addNewInventory: (data: addNewInventoryInterface) => Promise<void>;
}

export const useReceivedInventory = (): useReceivedInventoryInterface => {
  const realm = useRealm();
  const {saveDeliveryAgent} = useDeliveryAgent();
  const {addNewStockItem} = useStockItem();

  const getReceivedInventories = (): IReceivedInventory[] => {
    return (realm
      .objects<IReceivedInventory>(modelName)
      .filtered('is_deleted = false') as unknown) as IReceivedInventory[];
  };

  const addNewInventory = async ({
    delivery_agent,
    supplier,
    stockItems,
  }: addNewInventoryInterface): Promise<void> => {
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
        : await saveDeliveryAgent({delivery_agent});
    }

    // @ts-ignore
    if (savedDeliveryAgent) {
      receivedInventory.delivery_agent = savedDeliveryAgent;
      receivedInventory.delivery_agent_full_name = savedDeliveryAgent.full_name;
      receivedInventory.delivery_agent_mobile = savedDeliveryAgent.mobile;
    }

    const trace = await perf().startTrace('saveReceivedInventory');
    realm.write(() => {
      realm.create<IReceivedInventory>(
        modelName,
        receivedInventory,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    getGeolocationService()
      .getCurrentPosition()
      .then((location) => {
        realm.write(() => {
          realm.create<Partial<IReceivedInventory>>(
            modelName,
            {
              _id: receivedInventory._id,
              coordinates: convertToLocationString(location),
            },
            UpdateMode.Modified,
          );
        });
      });

    await BluebirdPromise.each(stockItems, async (stockItem) => {
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

      await addNewStockItem({stockItem: newStockItem});
    });
    getAnalyticsService().logEvent('inventoryReceived', {}).catch();
  };

  return {
    getReceivedInventories,
    addNewInventory,
  };
};
