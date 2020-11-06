import {ICreditPayment} from '@/models/CreditPayment';
import {useCreditPayment} from '@/services/credit-payment/hook';

interface deleteCreditPaymentInterface {
  creditPayment: ICreditPayment;
}

interface useCreditPaymentDeleteInterface {
  deleteCreditPayment: (data: deleteCreditPaymentInterface) => void;
}

export const useCreditPaymentDelete = (): useCreditPaymentDeleteInterface => {
  const {deleteCreditPayment} = useCreditPayment();

  const deleteCreditPaymentExtension = async ({
    creditPayment,
  }: deleteCreditPaymentInterface) => {
    await deleteCreditPayment({
      creditPayment,
    });
  };

  return {
    deleteCreditPayment: deleteCreditPaymentExtension,
  };
};
