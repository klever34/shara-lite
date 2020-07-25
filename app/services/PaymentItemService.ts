import Realm, {UpdateMode} from 'realm';
import {IPaymentItem, modelName} from '../models/PaymentItem';
import {IPayment} from '../models/Payment';
import {generateUniqueId} from '../helpers/utils';

export const savePaymentItem = ({
  realm,
  payment,
  name,
  quantity,
  price,
}: {
  realm: Realm;
  payment: IPayment;
  name: string;
  quantity: string;
  price: string;
}): void => {
  realm.write(() => {
    const paymentItem: IPaymentItem = {
      payment,
      name,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      total_price: quantity * price,
      id: generateUniqueId(),
      created_at: new Date(),
    };

    realm.create<IPaymentItem>(modelName, paymentItem, UpdateMode.Modified);
  });
};
