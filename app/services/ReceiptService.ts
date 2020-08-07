import Realm, {UpdateMode} from 'realm'
import {ICustomer} from '../models'
import {IReceipt, modelName} from '../models/Receipt'
import {saveReceiptItem} from './ReceiptItemService'
import {savePayment, updatePayment} from './PaymentService'
import {getBaseModelValues} from '../helpers/models'
import {saveCredit, updateCredit} from './CreditService'
import {Customer, Payment} from '../../types/app'
import {IReceiptItem} from '../models/ReceiptItem'
import {getPaymentsFromCredit} from './CreditPaymentService'
import {saveCustomer} from './CustomerService'

export const getReceipts = ({realm}: {realm: Realm}): IReceipt[] => {
  return (realm.objects<IReceipt>(modelName) as unknown) as IReceipt[]
}

export const saveReceipt = ({
  realm,
  customer,
  amountPaid,
  tax,
  dueDate,
  totalAmount,
  creditAmount,
  payments,
  receiptItems,
}: {
  realm: Realm
  dueDate?: Date
  customer: ICustomer | Customer
  amountPaid: number
  totalAmount: number
  creditAmount: number
  tax: number
  payments: Payment[]
  receiptItems: IReceiptItem[]
}): void => {
  const receipt: IReceipt = {
    tax,
    amount_paid: amountPaid,
    total_amount: totalAmount,
    credit_amount: creditAmount,
    ...getBaseModelValues(),
  }

  let receiptCustomer: ICustomer | Customer

  if (customer.name) {
    receipt.customer_name = customer.name
    receipt.customer_mobile = customer.mobile
  }

  if (!customer.id && customer.name && customer.mobile) {
    receiptCustomer = saveCustomer({realm, customer})
  }
  if (customer.id) {
    receiptCustomer = customer
  }

  receipt.customer = receiptCustomer as ICustomer

  realm.write(() => {
    realm.create<IReceipt>(modelName, receipt, UpdateMode.Modified)
  })

  payments.forEach(payment => {
    savePayment({
      realm,
      customer: receiptCustomer,
      receipt,
      type: 'receipt',
      ...payment,
    })
  })

  receiptItems.forEach((receiptItem: any) => {
    saveReceiptItem({
      realm,
      receipt,
      receiptItem,
    })
  })

  if (creditAmount > 0) {
    saveCredit({
      dueDate,
      creditAmount,
      customer: receiptCustomer,
      receipt,
      realm,
    })
  }
}

export const updateReceipt = ({
  realm,
  customer,
  receipt,
}: {
  realm: Realm
  customer: ICustomer
  receipt: IReceipt
}): void => {
  realm.write(() => {
    receipt.customer = customer
    ;(receipt.payments || []).forEach(payment => {
      updatePayment({realm, payment, updates: {customer}})
    })

    if (
      receipt.credit_amount > 0 &&
      receipt.credits &&
      receipt.credits.length
    ) {
      updateCredit({realm, credit: receipt.credits[0], updates: {customer}})
    }
  })
}

export const getAllPayments = ({receipt}: {receipt: IReceipt}) => {
  return [
    ...(receipt.payments || []),
    ...getPaymentsFromCredit({credits: receipt.credits}),
  ]
}
