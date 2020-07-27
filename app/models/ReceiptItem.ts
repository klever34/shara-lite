import {IReceipt} from './Receipt';
import {BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IReceiptItem extends BaseModelInterface {
  name: string;
  weight: string;
  quantity: number;
  price: number;
  total_price: number;
  receipt: IReceipt;
  product?: object;
}

export const modelName = 'ReceiptItem';

export class ReceiptItem implements Partial<IReceiptItem> {
  public static schema: Realm.ObjectSchema = {
    name: modelName,
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      name: 'string',
      weight: 'string',
      quantity: 'int',
      price: 'double',
      total_price: 'double',
      receipt: 'Receipt?',
    },
  };
}
