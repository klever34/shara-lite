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
import {getStorageService} from '@/services';
import {normalizeDb} from '@/services/realm/normalizations';

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

  const lastLocalSyncDateStorageKey = 'lastLocalSyncDate';
  const storageService = getStorageService();

  const updateSyncCompleteStatus = useCallback(async () => {
    const storedSyncDate = await storageService.getItem(
      lastLocalSyncDateStorageKey,
    );

    if (storedSyncDate) {
      setIsSyncCompleted(false);
    }
  }, [storageService, setIsSyncCompleted]);

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

    const currentDate = new Date();
    const storedSyncDate = (await storageService.getItem(
      lastLocalSyncDateStorageKey,
    )) as string;
    const lastLocalSyncDate = storedSyncDate
      ? new Date(storedSyncDate)
      : undefined;

    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
      partitionValue,
      lastLocalSyncDate,
    });

    setTimeout(() => {
      setIsSyncCompleted(true);
    }, 2000);
    syncRealm.current = newRealm;

    await storageService.setItem(lastLocalSyncDateStorageKey, currentDate);
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
  lastLocalSyncDate,
}: {
  syncRealm?: Realm;
  localRealm?: Realm;
  partitionValue: string;
  lastLocalSyncDate: Date | undefined;
}) => {
  if (!syncRealm || !localRealm) {
    return;
  }

  const useQueue = !!lastLocalSyncDate;

  normalizeDb({partitionKey: partitionValue, realm: localRealm});

  copyRealm({
    sourceRealm: localRealm,
    targetRealm: syncRealm,
    partitionValue,
    lastSyncDate: lastLocalSyncDate,
    useQueue,
  });

  copyRealm({
    sourceRealm: syncRealm,
    targetRealm: localRealm,
    partitionValue,
    useQueue,
  });

  syncRealmDbs({
    sourceRealm: localRealm,
    targetRealm: syncRealm,
    partitionValue,
  });

  syncRealmDbs({
    sourceRealm: syncRealm,
    targetRealm: localRealm,
    partitionValue,
  });
};

export default RealmProvider;
