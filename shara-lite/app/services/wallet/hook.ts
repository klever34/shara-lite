import {useRealm} from '@/services/realm';
import {IWallet, modelName} from '@/models/Wallet';

interface useWalletInterface {
  getWallet: () => IWallet | undefined;
}

export const useWallet = (): useWalletInterface => {
  const realm = useRealm();
  const getWallet = (): IWallet | undefined => {
    const wallets = realm.objects<IWallet>(modelName);
    return wallets.length ? wallets[0] : undefined;
  };

  return {
    getWallet,
  };
};
