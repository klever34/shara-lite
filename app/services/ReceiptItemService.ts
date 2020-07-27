import Realm, {UpdateMode} from 'realm';
import {IReceiptItem, modelName} from '../models/ReceiptItem';
import {IReceipt} from '../models/Receipt';

export const saveReceiptItem = ({
  realm,
  receipt,
  name,
  quantity,
  price,
  weight,
}: {
  realm: Realm;
  receipt: IReceipt;
  id: string;
  name: string;
  quantity: string;
  price: string;
  weight: string;
}): void => {
  realm.write(() => {
    const paymentItem: IReceiptItem = {
      receipt,
      name,
      weight,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      total_price: quantity * price,
    };

    realm.create<IReceiptItem>(modelName, paymentItem, UpdateMode.Modified);
  });
};
