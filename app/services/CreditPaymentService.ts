import Realm, {UpdateMode} from 'realm';
import {ICustomer} from '../models';
import {ICredit} from '../models/Credit';
import {ICreditPayment, modelName} from '../models/CreditPayment';
import {savePayment} from './PaymentService';
import {getBaseModelValues} from '../helpers/models';
import {updateCredit} from './CreditService';
import {IPayment} from 'app/models/Payment';
import {getCustomer} from './CustomerService';

export const getCreditPayments = ({
  realm,
}: {
  realm: Realm;
}): ICreditPayment[] => {
  return (realm.objects<ICreditPayment>(
    modelName,
  ) as unknown) as ICreditPayment[];
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
    customerId: customer.id as string,
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

    realm.write(() => {
      const creditPayment: ICreditPayment = {
        payment,
        credit,
        amount_paid: amount,
        ...getBaseModelValues(),
      };
      realm.create<ICredit>(modelName, creditPayment, UpdateMode.Modified);
    });

    amountLeft = amountLeftFromDeduction <= 0 ? 0 : amountLeftFromDeduction;
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
