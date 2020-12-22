import Realm, {UpdateMode} from 'realm';
import {ICustomer} from 'app-v2/models';
import {ICredit, modelName} from 'app-v2/models/Credit';
import {IReceipt} from 'app-v2/models/Receipt';
import {getBaseModelValues} from 'app-v2/helpers/models';
import {Customer} from 'types-v2/app';
import {getAnalyticsService, getAuthService} from 'app-v2/services';
import {deleteCreditPayment} from 'app-v2/services/CreditPaymentService';

export const getCredits = ({realm}: {realm: Realm}): ICredit[] => {
  return (realm
    .objects<ICredit>(modelName)
    .filtered('is_deleted != true') as unknown) as ICredit[];
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
      currency_code: getAuthService().getUser()?.currency_code ?? '',
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
    updated_at: new Date(),
  };

  realm.create(modelName, updatedCredit, UpdateMode.Modified);
};

export const deleteCredit = ({
  realm,
  credit,
}: {
  realm: Realm;
  credit: ICredit;
}) => {
  updateCredit({
    realm,
    credit,
    updates: {is_deleted: true},
  });

  credit.payments?.forEach((creditPayment) => {
    deleteCreditPayment({realm, creditPayment});
  });
};
