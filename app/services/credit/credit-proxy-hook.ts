import {
  deleteCreditPaymentInterface,
  useCreditPayment,
} from '@/services/credit-payment/hook';
import {updateCreditInterface, useCredit} from '@/services/credit';

interface useCreditPaymentDeleteInterface {
  updateCredit: (data: updateCreditInterface) => Promise<void>;
  deleteCreditPayment: (data: deleteCreditPaymentInterface) => void;
}

export const useCreditProxy = (): useCreditPaymentDeleteInterface => {
  const {updateCredit} = useCredit();
  const {deleteCreditPayment} = useCreditPayment();

  const updateCreditProxy = async ({
    credit,
    updates,
  }: updateCreditInterface) => {
    await updateCredit({
      credit,
      updates,
    });
  };

  const deleteCreditPaymentProxy = async ({
    creditPayment,
  }: deleteCreditPaymentInterface) => {
    await deleteCreditPayment({
      creditPayment,
    });
  };

  return {
    updateCredit: updateCreditProxy,
    deleteCreditPayment: deleteCreditPaymentProxy,
  };
};
