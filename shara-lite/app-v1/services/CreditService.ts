import Realm, {UpdateMode} from 'realm';
import {ICustomer} from 'app-v1/models';
import {ICredit, modelName} from 'app-v1/models/Credit';
import {IReceipt} from 'app-v1/models/Receipt';
import {getBaseModelValues} from 'app-v1/helpers/models';
import {Customer} from 'types-v1/app';
import {getAnalyticsService} from 'app-v1/services';

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

  getAnalyticsService()
    .logEvent('creditAdded', {
      item_id: credit?._id?.toString() ?? '',
      amount: creditAmount.toString(),
    })
    .then(() => {});
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

  realm.create(modelName, updatedCredit, UpdateMode.Modified);
};
