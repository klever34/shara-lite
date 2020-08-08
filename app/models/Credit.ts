import {ICustomer} from './Customer'
import {IReceipt} from './Receipt'
import {BaseModelInterface, baseModelSchema} from './baseSchema'
import {ICreditPayment} from './CreditPayment'

export interface ICredit extends BaseModelInterface {
  total_amount: number
  amount_paid: number
  amount_left: number
  fulfilled?: boolean
  due_date?: Date
  customer_name?: string
  customer_mobile?: string
  customer?: ICustomer
  receipt?: IReceipt
  payments?: ICreditPayment[]
}

export const modelName = 'Credit'

export class Credit implements Partial<ICredit> {
  public static schema: Realm.ObjectSchema = {
    name: 'Credit',
    primaryKey: 'id',
    properties: {
      ...baseModelSchema,
      total_amount: 'double',
      amount_paid: 'double',
      amount_left: 'double',
      due_date: 'date?',
      fulfilled: {type: 'bool', default: false},
      customer_name: 'string?',
      customer_mobile: 'string?',
      customer: 'Customer?',
      receipt: 'Receipt?',
      payments: {
        type: 'linkingObjects',
        objectType: 'CreditPayment',
        property: 'credit',
      },
    },
  }
}
