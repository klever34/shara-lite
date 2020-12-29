import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {IStockItem, modelName} from '@/models/StockItem';
import {useProduct} from '@/services/product';
import perf from '@react-native-firebase/perf';

interface addNewStockItemInterface {
  stockItem: IStockItem;
}

interface useStockItemInterface {
  getStockItems: () => IStockItem[];
  addNewStockItem: (data: addNewStockItemInterface) => Promise<void>;
}

export const useStockItem = (): useStockItemInterface => {
  const realm = useRealm();
  const {restockProduct} = useProduct();

  const getStockItems = (): IStockItem[] => {
    return (realm
      .objects<IStockItem>(modelName)
      .filtered('is_deleted != true') as unknown) as IStockItem[];
  };

  const addNewStockItem = async ({
    stockItem,
  }: addNewStockItemInterface): Promise<void> => {
    const trace = await perf().startTrace('saveStockItem');
    realm.write(() => {
      realm.create<IStockItem>(modelName, stockItem, UpdateMode.Modified);
    });
    await trace.stop();

    await restockProduct({
      product: stockItem.product,
      quantity: stockItem.quantity,
    });
  };

  return {
    getStockItems,
    addNewStockItem,
  };
};
