import React, {createContext, useEffect, useRef, useState} from 'react';

type RealmObject = {
  realm?: Realm;
  updateLocalRealm?: (realm: Realm) => void;
  updateSyncRealm?: (realm: Realm) => void;
};

export const RealmContext = createContext<RealmObject>({});

const RealmProvider = (props: any) => {
  const realm = useRef<Realm>(null);
  const syncRealm = useRef<Realm>(null);
  const localRealm = useRef<Realm>(null);

  const getRealmClone = (): Realm =>
    (({
      write(...args: any[]) {
        realmWrite({realm: syncRealm.current, args});
        realmWrite({realm: localRealm.current, args});
      },
      create(...args: any[]) {
        const syncedRecord = realmCreate({realm: syncRealm.current, args});
        const localRecord = realmCreate({realm: localRealm.current, args});
        return syncedRecord || localRecord;
      },
      objectForPrimaryKey(...args: any[]) {
        const syncedRecord = realmObjectForPrimaryKey({
          realm: syncRealm.current,
          args,
        });
        const localRecord = realmObjectForPrimaryKey({
          realm: localRealm.current,
          args,
        });
        return syncedRecord || localRecord;
      },
      objects(...args: any[]) {
        const syncedRecords = realmObjects({realm: syncRealm.current, args});
        const localRecords = realmObjects({realm: localRealm.current, args});
        return syncedRecords || localRecords;
      },
      delete(...args: any[]) {
        realmDelete({realm: syncRealm.current, args});
        realmDelete({realm: localRealm.current, args});
      },
      deleteAll(...args: any[]) {
        realmDeleteAll({realm: syncRealm.current, args});
        realmDeleteAll({realm: localRealm.current, args});
      },
      addListener(...args: any[]) {
        realmAddListener({realm: syncRealm.current, args});
        realmAddListener({realm: localRealm.current, args});
      },
      removeListener(...args: any[]) {
        realmRemoveListener({realm: syncRealm.current, args});
        realmRemoveListener({realm: localRealm.current, args});
      },
    } as unknown) as Realm);

  realm.current = getRealmClone();

  const updateSyncRealm = (realm: Realm) => {
    // @ts-ignore
    syncRealm.current = realm;
  };

  const updateLocalRealm = (realm: Realm) => {
    // @ts-ignore
    localRealm.current = realm;
  };

  return (
    <RealmContext.Provider
      value={{realm: realm.current, updateLocalRealm, updateSyncRealm}}>
      {props.children}
    </RealmContext.Provider>
  );
};

const realmWrite = ({realm, args}) => {
  if (realm) {
    return realm.write(...args);
  }
};

const realmCreate = ({realm, args}) => {
  if (realm) {
    const createRecord = () => {
      return realm.create(...args);
    };

    if (realm.isInTransaction) {
      return createRecord();
    } else {
      return realm.write(createRecord);
    }
  }
};

const realmObjects = ({realm, args}) => {
  if (realm) {
    return realm.objects(...args);
  }
};

const realmObjectForPrimaryKey = ({realm, args}) => {
  if (realm) {
    return realm.objectForPrimaryKey(...args);
  }
};

const realmDelete = ({realm, args}) => {
  if (realm) {
    return realm.delete(...args);
  }
};

const realmDeleteAll = ({realm, args}) => {
  if (realm) {
    return realm.deleteAll(...args);
  }
};

const realmAddListener = ({realm, args}) => {
  if (realm) {
    return realm.addListener(...args);
  }
};

const realmRemoveListener = ({realm, args}) => {
  if (realm) {
    return realm.removeListener(...args);
  }
};

export default RealmProvider;
