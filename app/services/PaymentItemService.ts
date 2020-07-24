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
    const priceFloat = parseFloat(price);
    const quantityFloat = parseFloat(quantity);
    const paymentItem: IPaymentItem = {
      payment,
      name,
      quantity: quantityFloat,
      price: priceFloat,
      total_price: quantityFloat * priceFloat,
      id: generateUniqueId(),
      created_at: new Date(),
    };

    realm.create<IPaymentItem>(modelName, paymentItem, UpdateMode.Modified);
  });
};
