import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export type FieldData = {
  key: string;
  label: string;
  value: string;
};

export interface IPaymentOption extends BaseModelInterface {
  name: string;
  slug: string;
  fields?: string;
  fieldsData?: Array<FieldData>;
}

export const modelName = 'PaymentOption';

export class PaymentOption extends BaseModel
  implements Partial<IPaymentOption> {
  public static schema: Realm.ObjectSchema = {
    name: 'PaymentOption',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      name: 'string?',
      slug: 'string?',
      fields: 'string?',
    },
  };

  public fields: string | undefined;

  public get fieldsData() {
    try {
      return JSON.parse(this.fields || '');
    } catch (e) {
      return [];
    }
  }
}
