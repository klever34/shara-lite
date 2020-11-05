import {UpdateMode} from 'realm';
import {useRealm} from '@/services/realm';
import {IAddress} from '@/models/Address';

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
    realm.write(() => {
      realm.create('Address', address, UpdateMode.Modified);
    });
  };

  return {
    saveAddress,
  };
};
