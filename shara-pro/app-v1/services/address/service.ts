import {IRealmService} from 'app-v1/services/realm';
import {IAddress} from 'app-v1/models/Address';
import {UpdateMode} from 'realm';

export interface IAddressService {
  saveAddress(address: Partial<IAddress>): void;
}

export class AddressService implements IAddressService {
  constructor(private realmService: IRealmService) {}
  saveAddress(address: IAddress): void {
    const realm = this.realmService.getInstance();
    if (!address._id) {
      return;
    }
    if (!realm) {
      return;
    }
    realm.write(() => {
      realm.create('Address', address, UpdateMode.Modified);
    });
  }
}
