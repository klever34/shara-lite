import Realm, {UpdateMode} from 'realm';
import {ICustomer} from '../models';
import {ICredit, modelName} from '../models/Credit';
import {IReceipt} from '../models/Receipt';
import {getBaseModelValues} from '../helpers/models';
import {Customer} from '../../types/app';

export const getCredits = ({realm}: {realm: Realm}): ICredit[] => {
  return (realm.objects<ICredit>(modelName) as unknown) as ICredit[];
};

export const saveCredit = ({
  realm,
  customer,
  receipt,
  dueDate,
  creditAmount,
}: {
  realm: Realm;
  dueDate?: Date;
  customer?: ICustomer | Customer;
  receipt?: IReceipt;
  creditAmount: number;
}): void => {
  const credit: ICredit = {
    receipt,
    due_date: dueDate,
    total_amount: creditAmount,
    amount_left: creditAmount,
    amount_paid: 0,
    ...getBaseModelValues(),
  };

  if (customer && customer.name) {
    credit.customer_name = customer?.name;
    credit.customer_mobile = customer?.mobile;
  }

  if (customer && customer._id) {
    credit.customer = customer as ICustomer;
  }

  realm.write(() => {
    realm.create<ICredit>(modelName, credit, UpdateMode.Modified);
  });
};

export const updateCredit = ({
  realm,
  credit,
  updates,
}: {
  realm: Realm;
  credit: ICredit;
  updates: object;
}) => {
  const updatedCredit = {
    _id: credit._id,
    ...updates,
  };

  realm.create<ICredit>(modelName, updatedCredit, UpdateMode.Modified);
};
