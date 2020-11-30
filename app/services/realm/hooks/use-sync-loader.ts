import {useCallback, useContext, useEffect} from 'react';
import Realm from 'realm';
import perf from '@react-native-firebase/perf';
import {createSyncRealm} from '../utils/create-realm';
import {RealmContext} from '../provider';
import {syncLocalData} from '@/services/realm/utils/sync-local-data';
import {
  getLocalLastSync,
  initLocalLastSyncStorage,
} from '@/services/realm/utils/sync-storage';
import {getAnalyticsService, getAuthService} from '@/services';

const syncInterval = 1000 * 20;

type initializeSyncSyncObject = {
  newRealm: Realm;
  realmUser: any;
  partitionValue: string;
};

const useSyncLoader = () => {
  const authService = getAuthService();
  const {
    realm,
    localRealm,
    syncRealm,
    modelUpdates,
    isSyncInProgress,
    setIsSyncInProgress,
    setIsSyncCompleted,
    setRealmUser,
    setModelUpdates,
  } = useContext(RealmContext);

  const retryUpdate = () => {
    setIsSyncCompleted && setIsSyncCompleted(true);
    setTimeout(() => {
      initializeSync().then(() => {});
    }, syncInterval);
  };

  const handleModelUpdates = (model: string) => {
    const updatedModels = {
      ...modelUpdates,
      [model]: Date.now(),
    };
    setModelUpdates(updatedModels);
  };

  const syncData = async ({
    newRealm,
    realmUser: user,
    partitionValue,
  }: initializeSyncSyncObject) => {
    const trace = await perf().startTrace('syncData');
    getAnalyticsService()
      .logEvent('syncStarted', {})
      .then(() => {});
    setRealmUser(user);
    syncRealm.current = newRealm;

    const lastLocalSync = await getLocalLastSync();
    localRealm.current &&
      (await initLocalLastSyncStorage({realm: localRealm.current}));

    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
      partitionValue,
      lastLocalSync,
      onModelUpdate: handleModelUpdates,
    });

    setTimeout(() => {
      setIsSyncCompleted(true);
    }, 2000);
    await trace.stop();
    getAnalyticsService()
      .logEvent('syncCompleted', {})
      .then(() => {});
  };

  const initializeSync = useCallback(
    async () => {
      const realmCredentials = authService.getRealmCredentials();
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
        const {
          realm: newRealm,
          realmUser,
          partitionValue,
        } = await createSyncRealm({
          jwt,
          hideError: true,
        });
        if (!newRealm) {
          retryUpdate();
          return;
        }

        await syncData({
          newRealm,
          realmUser,
          partitionValue: partitionValue || '',
        });
      } catch (e) {
        retryUpdate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authService],
  );

  useEffect(
    () => {
      if (isSyncInProgress) {
        return;
      }

      setIsSyncInProgress(true);
      initializeSync().then(() => {});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSyncInProgress],
  );
};

export default useSyncLoader;
