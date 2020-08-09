import Realm, {UpdateMode} from 'realm'
import {ISupplier, modelName} from '../models/Supplier'
import {getBaseModelValues} from '../helpers/models'
import {omit} from 'lodash'

export const getSuppliers = ({realm}: {realm: Realm}): ISupplier[] => {
  return (realm.objects<ISupplier>(modelName) as unknown) as ISupplier[]
}

export const getSupplierByMobile = ({
  realm,
  mobile,
}: {
  realm: Realm
  mobile: string
}): ISupplier | null => {
  const foundSuppliers = realm
    .objects<ISupplier>(modelName)
    .filtered(`mobile = "${mobile}" LIMIT(1)`)
  return foundSuppliers.length ? (omit(foundSuppliers[0]) as ISupplier) : null
}

export const saveSupplier = ({
  realm,
  supplier,
}: {
  realm: Realm
  supplier: ISupplier
}): void => {
  const supplierDetails: ISupplier = {
    ...supplier,
    ...getBaseModelValues(),
  }
  const existingSupplier = getSupplierByMobile({
    realm,
    mobile: supplier.mobile,
  })

  if (existingSupplier) {
    return existingSupplier
  }

  realm.write(() => {
    realm.create<ISupplier>(modelName, supplierDetails, UpdateMode.Modified)
  })
}
