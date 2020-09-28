import Realm, {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import {ICustomer} from '@/models';
import {ICredit} from '@/models/Credit';
import {ICreditPayment, modelName} from '@/models/CreditPayment';
import {savePayment} from './PaymentService';
import {getBaseModelValues} from '@/helpers/models';
import {updateCredit} from './CreditService';
import {IPayment} from '@/models/Payment';
import {getCustomer} from './customer/service';
import {getAnalyticsService} from '@/services';

export const getCreditPayments = ({
  realm,
}: {
  realm: Realm;
}): ICreditPayment[] => {
  return (realm
    .objects<ICreditPayment>(modelName)
    .filtered('is_deleted = false') as unknown) as ICreditPayment[];
};

export const saveCreditPayment = ({
  realm,
  customer,
  amount,
  method,
  note,
}: {
  realm: Realm;
  customer: ICustomer;
  amount: number;
  method: string;
  note?: string;
}): void => {
  const updatedCustomer = getCustomer({
    realm,
    customerId: customer._id as ObjectId,
  });
  const credits = updatedCustomer.credits;
  let amountLeft = amount;

  credits?.forEach((credit) => {
    if (amountLeft <= 0 || credit.fulfilled) {
      return;
    }

    const amountLeftFromDeduction = amountLeft - credit.amount_left;

    const creditUpdates: any = {
      _id: credit._id,
    };

    if (amountLeftFromDeduction >= 0) {
      creditUpdates.amount_left = 0;
      creditUpdates.fulfilled = true;
      creditUpdates.amount_paid = credit.amount_left;
      amountLeft = amountLeftFromDeduction;
    } else {
      creditUpdates.amount_left = Math.abs(amountLeftFromDeduction);
      creditUpdates.amount_paid = amountLeft;
    }

    realm.write(() => {
      updateCredit({realm, credit, updates: creditUpdates});
    });

    const paymentData = {
      customer,
      amount: creditUpdates.amount_paid,
      method,
      note,
      type: 'credit',
    };

    const payment = savePayment({
      realm,
      ...paymentData,
    });

    const creditPayment: ICreditPayment = {
      payment,
      credit,
      amount_paid: amount,
      ...getBaseModelValues(),
    };
    realm.write(() => {
      realm.create<ICreditPayment>(
        modelName,
        creditPayment,
        UpdateMode.Modified,
      );
    });

    amountLeft = amountLeftFromDeduction <= 0 ? 0 : amountLeftFromDeduction;
    getAnalyticsService()
      .logEvent('creditPaid', {
        method,
        amount: amount.toString(),
        remaining_balance: amountLeft.toString(),
        item_id: credit?._id?.toString() ?? '',
      })
      .then(() => {});
  });
};

export const getPaymentsFromCredit = ({credits}: {credits?: ICredit[]}) => {
  if (!credits || !credits.length) {
    return [];
  }

  return credits.reduce(
    (allCredits: IPayment[], credit) => [
      ...allCredits,
      ...(credit.payments || []).map(({payment}) => payment),
    ],
    [],
  );
};

export const updateCreditPayment = ({
  realm,
  creditPayment,
  updates,
}: {
  realm: Realm;
  creditPayment: ICreditPayment;
  updates: object;
}) => {
  const updatedCreditPayment = {
    _id: creditPayment._id,
    ...updates,
  };

  realm.create(modelName, updatedCreditPayment, UpdateMode.Modified);
};

export const deleteCreditPayment = ({
  realm,
  creditPayment,
}: {
  realm: Realm;
  creditPayment: ICreditPayment;
}) => {
  updateCreditPayment({
    realm,
    creditPayment,
    updates: {is_deleted: true},
  });
};
