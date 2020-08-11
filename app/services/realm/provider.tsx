import Realm, {UpdateMode} from 'realm';
import React, {createContext, useRef} from 'react';
import {pick} from 'lodash';
import {schema} from './index';

type RealmObject = {
  realm?: Realm;
  updateLocalRealm?: (realm: Realm) => void;
  updateSyncRealm?: (realm: Realm) => void;
  logoutFromRealm?: () => void;
};

type RealmCloneParams = {
  realm?: Realm;
  args: Array<any>;
};

export const RealmContext = createContext<RealmObject>({});

const RealmProvider = (props: any) => {
  const realm = useRef<Realm>();
  const syncRealm = useRef<Realm>();
  const localRealm = useRef<Realm>();

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

  const updateSyncRealm = (newRealm: Realm) => {
    syncLocalData({
      syncRealm: newRealm,
      localRealm: localRealm.current,
    });
    // @ts-ignore
    syncRealm.current = newRealm;
  };

  const updateLocalRealm = (newRealm: Realm) => {
    // @ts-ignore
    localRealm.current = newRealm;
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
  };

  return (
    <RealmContext.Provider
      value={{
        realm: realm.current,
        logoutFromRealm,
        updateLocalRealm,
        updateSyncRealm,
      }}>
      {props.children}
    </RealmContext.Provider>
  );
};

const realmWrite = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.isInTransaction ? args[0] : realm.write(...args);
  }
};

const realmCreate = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    const createRecord = () => {
      // @ts-ignore
      return realm.create(...args);
    };

    if (realm.isInTransaction) {
      return createRecord();
    } else {
      return realm.write(createRecord);
    }
  }
};

const realmObjects = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.objects(...args);
  }
};

const realmObjectForPrimaryKey = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.objectForPrimaryKey(...args);
  }
};

const realmDelete = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.delete(...args);
  }
};

const realmDeleteAll = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.deleteAll(...args);
  }
};

const realmAddListener = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.addListener(...args);
  }
};

const realmRemoveListener = ({realm, args}: RealmCloneParams) => {
  if (realm) {
    // @ts-ignore
    return realm.removeListener(...args);
  }
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

  syncRealm.write(() => {
    schema.forEach((model) => {
      localRealm.objects(model.schema.name).forEach((record: any) => {
        if (record) {
          syncRealm.create(model.schema.name, record, UpdateMode.Modified);
        }
      });
    });
  });

  localRealm.write(() => {
    schema.forEach((model) => {
      const localRealmProperties = Object.keys(model.schema.properties);
      syncRealm.objects(model.schema.name).forEach((record: any) => {
        if (record) {
          const recordToCreate = pick(record, localRealmProperties);
          console.log('====>', recordToCreate);
          localRealm?.create(
            model.schema.name,
            recordToCreate,
            UpdateMode.Modified,
          );
        }
      });
    });
  });
};

export default RealmProvider;
