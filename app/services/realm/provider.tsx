import Realm from 'realm';
import React, {createContext, useRef, useState} from 'react';
import {copyRealm} from '@/services/realm/copy-realm';
import {syncRealmDbs} from '@/services/realm/sync-realm-dbs';
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
  const [isSyncCompleted, setIsSyncCompleted] = useState<Boolean>(false);
  const [realm, setRealm] = useState<Realm>();
  const [realmUser, setRealmUser] = useState<any>(false);
  const syncRealm = useRef<Realm>();
  const localRealm = useRef<Realm>();

  const updateSyncRealm = ({
    newRealm,
    realmUser: user,
    partitionValue,
  }: {
    newRealm: Realm;
    realmUser: any;
    partitionValue: string;
  }) => {
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

    setTimeout(() => {
      setIsSyncCompleted(true);
    }, syncDuration + 2000);
    syncRealm.current = newRealm;
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

  normalizeDb({partitionKey: partitionValue, realm: localRealm});

  copyRealm({sourceRealm: localRealm, targetRealm: syncRealm, partitionValue});
  copyRealm({sourceRealm: syncRealm, targetRealm: localRealm, partitionValue});
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
