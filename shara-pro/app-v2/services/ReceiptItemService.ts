import Realm, {UpdateMode} from 'realm';
import {IReceipt} from 'app-v2/models/Receipt';
import {getBaseModelValues} from 'app-v2/helpers/models';
import {IReceiptItem, modelName} from 'app-v2/models/ReceiptItem';

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
    ...updates,
    updated_at: new Date(),
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
