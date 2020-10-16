import Realm from 'realm';
import React, {createContext, useRef, useState} from 'react';
import {copyRealm} from '@/services/realm/copy-realm';
import {syncRealmDbs} from '@/services/realm/sync-realm-dbs';
import {normalizeDb} from '@/services/realm/normalizations';
import perf from '@react-native-firebase/perf';

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
  const [isSyncCompleted, setIsSyncCompleted] = useState<Boolean>(false);
  const [realm, setRealm] = useState<Realm>();
  const [realmUser, setRealmUser] = useState<any>(false);
  const syncRealm = useRef<Realm>();
  const localRealm = useRef<Realm>();

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
    setIsSyncCompleted(false);

    const syncStart = Date.now();

    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
      partitionValue,
    });

    const syncEnd = Date.now();
    const syncDuration = syncEnd - syncStart;
    console.log('*******', syncDuration / 1000);

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
}: {
  syncRealm?: Realm;
  localRealm?: Realm;
  partitionValue: string;
}) => {
  if (!syncRealm || !localRealm) {
    return;
  }

  const syncDate = new Date(
    'Tue Oct 11 2020 09:26:43 GMT+0100 (West Africa Standard Time)',
  );

  normalizeDb({partitionKey: partitionValue, realm: localRealm});

  copyRealm({
    sourceRealm: localRealm,
    targetRealm: syncRealm,
    partitionValue,
    syncDate,
  });
  copyRealm({
    sourceRealm: syncRealm,
    targetRealm: localRealm,
    partitionValue,
    syncDate,
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
