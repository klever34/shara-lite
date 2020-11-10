import {useCallback, useContext, useEffect} from 'react';
// import NetInfo from '@react-native-community/netinfo';
import {getAuthService, getRealmService} from '../index';
import {loginToRealm} from './index';
import {RealmContext} from './provider';

const syncInterval = 1000 * 20;

const useRealmSyncLoader = () => {
  const authService = getAuthService();

  const {
    realm,
    updateSyncRealm,
    isRealmSyncLoaderInitiated,
    setIsRealmSyncLoaderInitiated,
    setIsSyncCompleted,
  } = useContext(RealmContext);

  const retryUpdate = () => {
    setIsSyncCompleted && setIsSyncCompleted(true);
    setTimeout(() => {
      updateRealm();
    }, syncInterval);
  };

  const updateRealm = useCallback(
    async () => {
      const realmCredentials = authService.getRealmCredentials();
      if (realmCredentials) {
        return;
      }

      if (!realmCredentials) {
        retryUpdate();
        return;
      }

      try {
        if (!realm) {
          retryUpdate();
          return;
        }

        const {jwt} = realmCredentials;
        const {realm: newRealm, realmUser, partitionValue} = await loginToRealm(
          {
            jwt,
            hideError: true,
          },
        );
        if (!newRealm) {
          retryUpdate();
          return;
        }

        updateSyncRealm &&
          (await updateSyncRealm({
            newRealm,
            realmUser,
            partitionValue: partitionValue || '',
          }));
        const realmService = getRealmService();
        realmService.setInstance(newRealm);
      } catch (e) {
        retryUpdate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authService, updateSyncRealm],
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

      setIsRealmSyncLoaderInitiated && setIsRealmSyncLoaderInitiated(true);
      updateRealm();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isRealmSyncLoaderInitiated],
  );
};

export default useRealmSyncLoader;
