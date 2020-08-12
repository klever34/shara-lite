import {useCallback, useContext, useEffect, useState, useRef} from 'react';
// import NetInfo from '@react-native-community/netinfo';
import {getAuthService, getRealmService} from '../index';
import {RealmContext} from './provider';
import {loginToRealm} from './index';

const useRealmSyncLoader = () => {
  const unsubscribeFromRealmCheck = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedRealm, setHasLoadedRealm] = useState(false);
  const authService = getAuthService();
  const {updateSyncRealm} = useContext(RealmContext);

  const updateRealm = useCallback(async () => {
    if (isLoading || hasLoadedRealm) {
      return;
    }
    if (
      hasLoadedRealm &&
      unsubscribeFromRealmCheck.current &&
      typeof unsubscribeFromRealmCheck.current === 'function'
    ) {
      // @ts-ignore
      unsubscribeFromRealmCheck.current && unsubscribeFromRealmCheck.current();
      unsubscribeFromRealmCheck.current = undefined;
      return;
    }

    const realmCredentials = authService.getRealmCredentials();
    if (!realmCredentials) {
      return;
    }

    try {
      setIsLoading(true);
      const {jwt} = realmCredentials;
      const createdRealm = await loginToRealm({jwt, hideError: true});
      if (createdRealm) {
        updateSyncRealm && updateSyncRealm(createdRealm);
        const realmService = getRealmService();
        realmService.setInstance(createdRealm);
        setHasLoadedRealm(true);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  }, [authService, updateSyncRealm, hasLoadedRealm, isLoading]);

  /*
  unsubscribeFromRealmCheck.current = NetInfo.addEventListener((state) => {
    if (state.isConnected && !isLoading && !hasLoadedRealm) {
      updateRealm();
    }
  });
  */

  useEffect(() => {
    if (unsubscribeFromRealmCheck.current) {
      return;
    }

    // @ts-ignore
    unsubscribeFromRealmCheck.current = setInterval(() => {
      updateRealm();
    }, 1000 * 60 * 10);
  }, [updateRealm]);

  useEffect(() => {
    updateRealm();
  }, [updateRealm]);
};

export default useRealmSyncLoader;