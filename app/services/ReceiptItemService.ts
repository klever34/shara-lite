import Realm, {UpdateMode} from 'realm';
import {IReceiptItem, modelName} from '../models/ReceiptItem';
import {IReceipt} from '../models/Receipt';
import {getBaseModelValues} from '../helpers/models';

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
