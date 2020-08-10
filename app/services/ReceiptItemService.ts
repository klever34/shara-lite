import Realm, {UpdateMode} from 'realm';
import {IReceiptItem, modelName} from '../models/ReceiptItem';
import {IReceipt} from '../models/Receipt';
import {getBaseModelValues} from '../helpers/models';
import {ReceiptItem} from '../../types/app';

export const saveReceiptItem = ({
  realm,
  receipt,
  receiptItem,
}: {
  realm: Realm;
  receipt: IReceipt;
  receiptItem: ReceiptItem;
}): void => {
  const {quantity, price} = receiptItem;
  const receiptItemToSave: IReceiptItem = {
    receipt,
    name: receiptItem.product.name,
    sku: receiptItem.product.sku,
    weight: receiptItem.product.weight,
    quantity: parseInt(quantity, 10),
    price: parseFloat(price),
    total_price: parseFloat(quantity) * parseFloat(price),
    product: receiptItem.product,
    ...getBaseModelValues(),
  };

  realm.write(() => {
    realm.create<IReceiptItem>(
      modelName,
      receiptItemToSave,
      UpdateMode.Modified,
    );
  });
};
