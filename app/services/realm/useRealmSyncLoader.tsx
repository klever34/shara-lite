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
    if (isLoading) {
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

    const {jwt} = authService.getRealmCredentials();
    try {
      setIsLoading(true);
      const createdRealm = await loginToRealm({jwt, hideError: true});
      updateSyncRealm && updateSyncRealm(createdRealm);
      const realmService = getRealmService();
      realmService.setInstance(createdRealm);
      setIsLoading(false);
      setHasLoadedRealm(true);
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
