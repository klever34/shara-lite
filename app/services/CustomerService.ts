import {ICustomer, modelName} from '../models'
import Realm, {UpdateMode} from 'realm'
import {getBaseModelValues} from '../helpers/models'
import {omit} from 'lodash'

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
  const existingCustomer = getCustomerByMobile({
    realm,
    mobile: customerDetails.mobile,
  })

  if (existingCustomer) {
    return existingCustomer
  }

  realm.write(() => {
    realm.create<ICustomer>(modelName, customerDetails, UpdateMode.Modified)
  })

  return customerDetails
}

export const getCustomerByMobile = ({
  realm,
  mobile,
}: {
  realm: Realm
  mobile: string
}): ICustomer | null => {
  const foundCustomers = realm
    .objects<ICustomer>(modelName)
    .filtered(`mobile = "${mobile}" LIMIT(1)`)
  return foundCustomers.length ? (omit(foundCustomers[0]) as ICustomer) : null
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
