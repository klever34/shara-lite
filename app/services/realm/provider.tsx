import Realm, {UpdateMode} from 'realm';
import React, {createContext, useRef, useState} from 'react';
import {pick, omit} from 'lodash';
import {schema} from './index';
import {copyRealm} from '@/services/realm/copy-realm';

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

  // realm.current = localRealm.current || {};

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
  copyRealm(localRealm, syncRealm);
  copyRealm(syncRealm, localRealm);
  return;
  // @ts-ignore
  const collectionListenerRetainer = localRealm?.objects('Customer');
  // Observe Collection Notifications
  // @ts-ignore
  function listener(puppies, changes) {
    // Update UI in response to inserted objects
    // @ts-ignore
    changes.insertions.forEach((index) => {
      let insertedDog = puppies[index];
      console.log(omit(insertedDog));
    });

    // Update UI in response to modified objects
    // @ts-ignore
    changes.modifications.forEach((index) => {
      let modifiedDog = puppies[index];
    });

    // Update UI in response to deleted objects
    // @ts-ignore
    changes.deletions.forEach((index) => {
      // Deleted objects cannot be accessed directly
      // Support for accessing deleted objects coming soon...
    });
  }

  // @ts-ignore
  collectionListenerRetainer.addListener(listener);

  return;
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
