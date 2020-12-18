import {UpdateMode} from 'realm';
import perf from '@react-native-firebase/perf';
import {useRealm} from '@/services/realm';
import {getBaseModelValues} from '@/helpers/models';
import {IPaymentOption, modelName} from '@/models/PaymentOption';

interface savePaymentOptionInterface {
  paymentOption: IPaymentOption;
}

interface updatePaymentOptionInterface {
  paymentOption: IPaymentOption;
  updates: Partial<IPaymentOption>;
}

interface deletePaymentOptionInterface {
  paymentOption: IPaymentOption;
}

interface usePaymentOptionInterface {
  getPaymentOptions: () => IPaymentOption[];
  savePaymentOption: (
    data: savePaymentOptionInterface,
  ) => Promise<IPaymentOption>;
  updatePaymentOption: (data: updatePaymentOptionInterface) => Promise<void>;
  deletePaymentOption: (data: deletePaymentOptionInterface) => Promise<void>;
}

export const usePaymentOption = (): usePaymentOptionInterface => {
  const realm = useRealm();

  const getPaymentOptions = (): IPaymentOption[] => {
    return (realm
      .objects<IPaymentOption>(modelName)
      .filtered('is_deleted != true') as unknown) as IPaymentOption[];
  };

  const savePaymentOption = async ({
    paymentOption,
  }: savePaymentOptionInterface): Promise<IPaymentOption> => {
    const updatedPaymentOption: IPaymentOption = {
      name: paymentOption.name,
      slug: paymentOption.slug,
      fields: JSON.stringify(paymentOption.fieldsData),
      ...getBaseModelValues(),
    };

    const trace = await perf().startTrace('savePaymentOption');
    realm.write(() => {
      realm.create<IPaymentOption>(
        modelName,
        updatedPaymentOption,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    return paymentOption;
  };

  const updatePaymentOption = async ({
    paymentOption,
    updates,
  }: updatePaymentOptionInterface) => {
    const updatedPaymentOption = {
      _id: paymentOption._id,
      ...updates,
      updated_at: new Date(),
    };

    if (updates.fieldsData) {
      updatedPaymentOption.fields = JSON.stringify(
        updatedPaymentOption.fieldsData,
      );
      delete updatedPaymentOption.fieldsData;
    }

    const trace = await perf().startTrace('updatePaymentOption');
    realm.write(() => {
      realm.create(modelName, updatedPaymentOption, UpdateMode.Modified);
    });
    await trace.stop();
  };

  const deletePaymentOption = async ({
    paymentOption,
  }: deletePaymentOptionInterface) => {
    await updatePaymentOption({paymentOption, updates: {is_deleted: true}});
  };

  return {
    getPaymentOptions,
    savePaymentOption,
    updatePaymentOption,
    deletePaymentOption,
  };
};
