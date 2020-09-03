import {useCallback, useContext, useEffect, useState} from 'react';
// import NetInfo from '@react-native-community/netinfo';
import {getAuthService, getRealmService} from '../index';
import {RealmContext} from './provider';
import {loginToRealm} from './index';

const syncInterval = 1000 * 20;

const useRealmSyncLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedRealm, setHasLoadedRealm] = useState(false);
  const authService = getAuthService();
  const {
    updateSyncRealm,
    isRealmSyncLoaderInitiated,
    setIsRealmSyncLoaderInitiated,
  } = useContext(RealmContext);

  const retryUpdate = () => {
    setTimeout(() => {
      updateRealm();
    }, syncInterval);
  };

  const updateRealm = useCallback(
    async () => {
      if (isLoading || hasLoadedRealm) {
        return;
      }

      const realmCredentials = authService.getRealmCredentials();
      if (!realmCredentials) {
        retryUpdate();
        return;
      }

      try {
        setIsLoading(true);
        const {jwt} = realmCredentials;
        const {realm: newRealm, realmUser} = await loginToRealm({
          jwt,
          hideError: true,
        });
        setIsLoading(false);
        if (!newRealm) {
          retryUpdate();
          return;
        }

        updateSyncRealm && updateSyncRealm({newRealm, realmUser});
        const realmService = getRealmService();
        realmService.setInstance(newRealm);
        setHasLoadedRealm(true);
      } catch (e) {
        setIsLoading(false);
        retryUpdate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authService, updateSyncRealm, hasLoadedRealm, isLoading],
  );

  /*
  unsubscribeFromRealmCheck.current = NetInfo.addEventListener((state) => {
    if (state.isConnected && !isLoading && !hasLoadedRealm) {
      updateRealm();
    }
  });
  */

  useEffect(
    () => {
      if (isRealmSyncLoaderInitiated) {
        return;
      }

      setHasLoadedRealm(false);
      setIsRealmSyncLoaderInitiated && setIsRealmSyncLoaderInitiated(true);
      updateRealm();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRealmSyncLoaderInitiated],
  );
};

export default useRealmSyncLoader;
