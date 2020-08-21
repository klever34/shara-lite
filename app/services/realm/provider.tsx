import Realm from 'realm';
import React, {createContext, useRef, useState} from 'react';
import {copyRealm} from '@/services/realm/copy-realm';
import {syncLocalRealm} from '@/services/realm/sync-local-realm';

type RealmObject = {
  realm?: Realm;
  isRealmSyncLoaderInitiated?: Boolean;
  updateLocalRealm?: (realm: Realm) => void;
  updateSyncRealm?: (realm: Realm) => void;
  logoutFromRealm?: () => void;
  setIsRealmSyncLoaderInitiated?: (isLoaded: Boolean) => void;
};

type RealmCloneParams = {
  realm?: Realm;
  args: Array<any>;
};

export const RealmContext = createContext<RealmObject>({});

const RealmProvider = (props: any) => {
  const [isRealmSyncLoaderInitiated, setIsRealmSyncLoaderInitiated] = useState<
    Boolean
  >(false);
  const [realm, setRealm] = useState<Realm>();
  const syncRealm = useRef<Realm>();
  const localRealm = useRef<Realm>();

  const updateSyncRealm = (newRealm: Realm) => {
    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
    });
    syncRealm.current = newRealm;
  };

  const updateLocalRealm = (newRealm: Realm) => {
    localRealm.current = newRealm;
    setRealm(newRealm);
  };

  const logoutFromRealm = () => {
    if (syncRealm.current) {
      syncRealm.current = undefined;
    }

    if (localRealm.current) {
      localRealm.current.write(() => {
        localRealm.current?.deleteAll();
      });
    }

    setIsRealmSyncLoaderInitiated(false);
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
}: {
  syncRealm?: Realm;
  localRealm?: Realm;
}) => {
  if (!syncRealm || !localRealm) {
    return;
  }

  copyRealm({sourceRealm: localRealm, targetRealm: syncRealm});
  copyRealm({sourceRealm: syncRealm, targetRealm: localRealm});
  syncLocalRealm({localRealm, syncRealm});
};

export default RealmProvider;
