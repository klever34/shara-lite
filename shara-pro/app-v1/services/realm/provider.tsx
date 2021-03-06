import Realm from 'realm';
import React, {createContext, useRef, useState} from 'react';
import {copyRealm} from 'app-v1/services/realm/copy-realm';
import {syncRealmDbs} from 'app-v1/services/realm/sync-realm-dbs';
import {normalizeDb} from 'app-v1/services/realm/normalizations';

type RealmObject = {
  realm?: Realm;
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
};

export const RealmContext = createContext<RealmObject>({});

const RealmProvider = (props: any) => {
  const [isRealmSyncLoaderInitiated, setIsRealmSyncLoaderInitiated] = useState<
    Boolean
  >(false);
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
    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
      partitionValue,
    });
    syncRealm.current = newRealm;
  };

  const updateLocalRealm = (newRealm: Realm) => {
    localRealm.current = newRealm;
    setRealm(newRealm);
  };

  const logoutFromRealm = () => {
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

    setIsRealmSyncLoaderInitiated(false);
    setRealm(undefined);
  };

  return (
    <RealmContext.Provider
      value={{
        realm,
        isRealmSyncLoaderInitiated,
        logoutFromRealm,
        updateLocalRealm,
        updateSyncRealm,
        setIsRealmSyncLoaderInitiated,
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
