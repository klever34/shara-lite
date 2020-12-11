import {useContext} from 'react';
import {RealmContext} from '@/services/realm/provider';
import {clearQueue} from '@/services/realm/utils/queue';

export const useRealmLogout = () => {
  const {
    realmUser,
    localRealm,
    syncRealm,
    setRealm,
    setRealmUser,
    setIsSyncInProgress,
    setIsSyncCompleted,
  } = useContext(RealmContext);

  const logoutFromRealm = () => {
    setIsSyncInProgress(false);
    setRealm(undefined);
    setIsSyncCompleted(true);
    clearQueue();

    if (localRealm.current) {
      localRealm.current?.removeAllListeners();

      localRealm.current.write(() => {
        localRealm.current?.deleteAll();
      });
    }

    if (syncRealm.current) {
      syncRealm.current?.removeAllListeners();

      if (realmUser) {
        // @ts-ignore
        realmUser.logOut();
        setRealmUser(undefined);
      }
    }

    setIsSyncCompleted(false);
  };

  return {
    logoutFromRealm,
  };
};
