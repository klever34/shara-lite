import {useContext} from 'react';
import {RealmContext} from '@/services/realm/provider';
import {createLocalRealm} from '@/services/realm/utils/create-realm';
import {getRealmService} from '@/services';

export const useInitRealm = () => {
  const {localRealm, setRealm, setIsSyncCompleted} = useContext(RealmContext);

  const initRealm = async ({isNewUser}: {isNewUser?: boolean} = {}) => {
    const createdLocalRealm = await createLocalRealm();
    localRealm.current = createdLocalRealm;
    setRealm(createdLocalRealm);
    setIsSyncCompleted(!!isNewUser);

    const realmService = getRealmService();
    realmService.setInstance(createdLocalRealm);
  };

  return {
    initRealm,
  };
};
