import {IReceipt} from './Receipt';
import {IProduct} from './Product';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IReceiptItem extends BaseModelInterface {
  name: string;
  sku: string;
  weight?: string;
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
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      sku: 'string',
      quantity: 'int',
      price: 'double',
      total_price: 'double',
      weight: 'string?',
      receipt: 'Receipt?',
      product: 'Product?',
    },
  };
}
