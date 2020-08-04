import {IReceipt} from './Receipt';
import {IProduct} from './Product';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IReceiptItem extends BaseModelInterface {
  quantity: number;
  price: number;
  total_price: number;
  receipt: IReceipt;
  product: IProduct;
}

export const modelName = 'ReceiptItem';

export class ReceiptItem implements Partial<IReceiptItem> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      quantity: 'int',
      price: 'double',
      total_price: 'double',
      receipt: 'Receipt?',
      product: 'Product?',
    },
  };
}
