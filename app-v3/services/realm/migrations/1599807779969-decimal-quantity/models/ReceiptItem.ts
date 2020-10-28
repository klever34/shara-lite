import {IProduct} from 'app-v3/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Product';
import {IReceipt} from 'app-v3/services/realm/migrations/1598342143007-add-optional-is-deleted-fields/models/Receipt';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IReceiptItem extends BaseModelInterface {
  name: string;
  sku?: string;
  weight?: string;
  quantity: number;
  price: number;
  total_price: number;
  receipt: IReceipt;
  product: IProduct;
}

export const modelName = 'ReceiptItem';

export class ReceiptItem extends BaseModel implements Partial<IReceiptItem> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string?',
      sku: 'string?',
      quantity: 'double?',
      price: 'double?',
      total_price: 'double?',
      weight: 'string?',
      receipt: 'Receipt?',
      product: 'Product?',
    },
  };
}
