import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {IAddress} from '@/models/Address';
import perf from '@react-native-firebase/perf';

interface saveAddressInterface {
  address: IAddress;
}

interface useAddressInterface {
  saveAddress: (data: saveAddressInterface) => Promise<void>;
}

export const useAddress = (): useAddressInterface => {
  const realm = useRealm();
  const saveAddress = async ({
    address,
  }: saveAddressInterface): Promise<void> => {
    if (!address._id) {
      return;
    }

    const trace = await perf().startTrace('saveAddress');
    realm.write(() => {
      realm.create('Address', address, UpdateMode.Modified);
    });
    await trace.stop();
  };

  return {
    saveAddress,
  };
};
