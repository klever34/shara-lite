import Realm, {UpdateMode} from 'realm';
import {IReceipt} from '@/models/Receipt';
import {getBaseModelValues} from '@/helpers/models';
import {IReceiptItem, modelName} from '@/models/ReceiptItem';

export const saveReceiptItem = ({
  realm,
  receipt,
  receiptItem,
}: {
  realm: Realm;
  receipt: IReceipt;
  receiptItem: IReceiptItem;
}): void => {
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

  realm.create<IReceiptItem>(modelName, receiptItemToSave, UpdateMode.Modified);
};

export const updateReceiptItem = ({
  realm,
  receiptItem,
  updates,
}: {
  realm: Realm;
  receiptItem: IReceiptItem;
  updates: object;
}) => {
  const updatedReceiptItem = {
    _id: receiptItem._id,
    updated_at: new Date(),
    ...updates,
  };

  realm.create(modelName, updatedReceiptItem, UpdateMode.Modified);
};

export const deleteReceiptItem = ({
  realm,
  receiptItem,
}: {
  realm: Realm;
  receiptItem: IReceiptItem;
}) => {
  updateReceiptItem({
    realm,
    receiptItem,
    updates: {is_deleted: true},
  });
};
