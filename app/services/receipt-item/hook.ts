import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {IReceipt} from '@/models/Receipt';
import {getBaseModelValues} from '@/helpers/models';
import {IReceiptItem, modelName} from '@/models/ReceiptItem';
import perf from '@react-native-firebase/perf';

interface saveReceiptItemInterface {
  receipt: IReceipt;
  receiptItem: IReceiptItem;
}

interface updateReceiptItemInterface {
  receiptItem: IReceiptItem;
  updates: object;
}

interface deleteReceiptItemInterface {
  receiptItem: IReceiptItem;
}

interface useReceiptItemInterface {
  saveReceiptItem: (data: saveReceiptItemInterface) => Promise<void>;
  updateReceiptItem: (data: updateReceiptItemInterface) => void;
  deleteReceiptItem: (data: deleteReceiptItemInterface) => void;
}

export const useReceiptItem = (): useReceiptItemInterface => {
  const realm = useRealm();

  const saveReceiptItem = async ({
    receipt,
    receiptItem,
  }: saveReceiptItemInterface): Promise<void> => {
    const {quantity, price} = receiptItem;
    const receiptItemToSave: IReceiptItem = {
      receipt,
      name: receiptItem.product.name,
      sku: receiptItem.product.sku,
      weight: receiptItem.product.weight,
      quantity: quantity,
      price: price,
      total_price: quantity * price,
      product: receiptItem.product,
      ...getBaseModelValues(),
    };

    const trace = await perf().startTrace('saveReceiptItem');
    realm.write(() => {
      realm.create<IReceiptItem>(
        modelName,
        receiptItemToSave,
        UpdateMode.Modified,
      );
    });
    await trace.stop();
  };

  const updateReceiptItem = async ({
    receiptItem,
    updates,
  }: updateReceiptItemInterface) => {
    const updatedReceiptItem = {
      _id: receiptItem._id,
      ...updates,
      updated_at: new Date(),
    };

    const trace = await perf().startTrace('updateReceiptItem');
    realm.write(() => {
      realm.create(modelName, updatedReceiptItem, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deleteReceiptItem = async ({
    receiptItem,
  }: deleteReceiptItemInterface) => {
    await updateReceiptItem({
      receiptItem,
      updates: {is_deleted: true},
    });
  };

  return {
    saveReceiptItem,
    updateReceiptItem,
    deleteReceiptItem,
  };
};
