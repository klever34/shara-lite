import Realm from 'realm';
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {copyRealm} from '@/services/realm/copy-realm';
import {syncRealmDbs} from '@/services/realm/sync-realm-dbs';
import perf from '@react-native-firebase/perf';
import {normalizeDb} from '@/services/realm/normalizations';
import {
  getLocalLastSync,
  initLocalLastSyncStorage,
} from '@/services/realm/utils';

type RealmObject = {
  realm?: Realm;
  isSyncCompleted?: Boolean;
  isRealmSyncLoaderInitiated?: Boolean;
  updateLocalRealm?: (realm: Realm) => void;
  updateSyncRealm?: ({
    newRealm,
    realmUser,
    partitionValue,
  }: {
    newRealm: Realm;
    realmUser: any;
    partitionValue: string;
  }) => void;
  logoutFromRealm?: () => void;
  setIsRealmSyncLoaderInitiated?: (isLoaded: Boolean) => void;
  setIsSyncCompleted?: (isLoaded: Boolean) => void;
};

export const RealmContext = createContext<RealmObject>({});

const RealmProvider = (props: any) => {
  const [isRealmSyncLoaderInitiated, setIsRealmSyncLoaderInitiated] = useState<
    Boolean
  >(false);
  const [isSyncCompleted, setIsSyncCompleted] = useState<Boolean>(true);
  const [realm, setRealm] = useState<Realm>();
  const [realmUser, setRealmUser] = useState<any>(false);
  const syncRealm = useRef<Realm>();
  const localRealm = useRef<Realm>();

  const updateSyncCompleteStatus = useCallback(async () => {
    const storedSyncDate = await getLocalLastSync();

    if (!storedSyncDate) {
      setIsSyncCompleted(false);
    }
  }, [setIsSyncCompleted]);

  useEffect(() => {
    updateSyncCompleteStatus();
  }, [updateSyncCompleteStatus]);

  const updateSyncRealm = async ({
    newRealm,
    realmUser: user,
    partitionValue,
  }: {
    newRealm: Realm;
    realmUser: any;
    partitionValue: string;
  }) => {
    // TODO Sync trace
    const trace = await perf().startTrace('updateSyncRealm');
    setRealmUser(user);

    const lastLocalSync = await getLocalLastSync();
    localRealm.current &&
      (await initLocalLastSyncStorage({realm: localRealm.current}));

    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
      partitionValue,
      lastLocalSync,
    });

    setTimeout(() => {
      setIsSyncCompleted(true);
    }, 2000);
    syncRealm.current = newRealm;
    await trace.stop();
  };

  const updateLocalRealm = (newRealm: Realm) => {
    localRealm.current = newRealm;
    setRealm(newRealm);
  };

  const logoutFromRealm = () => {
    setIsRealmSyncLoaderInitiated(false);
    setRealm(undefined);
    setIsSyncCompleted(true);

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

  return (
    <RealmContext.Provider
      value={{
        realm,
        isSyncCompleted,
        isRealmSyncLoaderInitiated,
        logoutFromRealm,
        updateLocalRealm,
        updateSyncRealm,
        setIsRealmSyncLoaderInitiated,
        setIsSyncCompleted,
      }}>
      {props.children}
    </RealmContext.Provider>
  );
};

const syncLocalData = ({
  syncRealm,
  localRealm,
  partitionValue,
  lastLocalSync,
}: {
  syncRealm?: Realm;
  localRealm?: Realm;
  partitionValue: string;
  lastLocalSync: any | undefined;
}) => {
  if (!syncRealm || !localRealm) {
    return;
  }

  const useQueue = !!lastLocalSync;

  normalizeDb({partitionKey: partitionValue, realm: localRealm});

  copyRealm({
    sourceRealm: localRealm,
    targetRealm: syncRealm,
    partitionValue,
    lastLocalSync,
    useQueue,
    isLocal: true,
  });

  copyRealm({
    sourceRealm: syncRealm,
    targetRealm: localRealm,
    partitionValue,
    lastLocalSync,
    useQueue,
    isLocal: false,
  });

  syncRealmDbs({
    sourceRealm: localRealm,
    targetRealm: syncRealm,
    partitionValue,
    isLocal: true,
  });

  syncRealmDbs({
    sourceRealm: syncRealm,
    targetRealm: localRealm,
    partitionValue,
  });
};

export default RealmProvider;
