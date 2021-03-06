import Realm, {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import {ICustomer} from 'app-v2/models';
import {ICredit} from 'app-v2/models/Credit';
import {ICreditPayment, modelName} from 'app-v2/models/CreditPayment';
import {savePayment} from './PaymentService';
import {getBaseModelValues} from 'app-v2/helpers/models';
import {updateCredit} from './CreditService';
import {IPayment} from 'app-v2/models/Payment';
import {getCustomer} from './customer/service';
import {getAnalyticsService, getAuthService} from 'app-v2/services';

export const getCreditPayments = ({
  realm,
}: {
  realm: Realm;
}): ICreditPayment[] => {
  return (realm
    .objects<ICreditPayment>(modelName)
    .filtered('is_deleted != true') as unknown) as ICreditPayment[];
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
        currency_code: getAuthService().getUser()?.currency_code ?? '',
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
    updated_at: new Date(),
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
