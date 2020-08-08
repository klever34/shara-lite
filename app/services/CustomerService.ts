import {ICustomer, modelName} from '../models'
import Realm, {UpdateMode} from 'realm'
import {getBaseModelValues} from '../helpers/models'

export const getCustomers = ({realm}: {realm: Realm}): ICustomer[] => {
  return (realm.objects<ICustomer>(modelName) as unknown) as ICustomer[]
}

export const saveCustomer = ({
  realm,
  customer,
}: {
  realm: Realm
  customer: ICustomer
}): ICustomer => {
  const customerDetails: ICustomer = {
    ...customer,
    name: customer.name,
    mobile: customer.mobile,
    ...getBaseModelValues(),
  }

  realm.write(() => {
    realm.create<ICustomer>(modelName, customerDetails, UpdateMode.Modified)
  })

  return customerDetails
}

export const getCustomer = ({
  realm,
  customerId,
}: {
  realm: Realm
  customerId: string
}) => {
  return realm.objectForPrimaryKey(modelName, customerId) as ICustomer
}
