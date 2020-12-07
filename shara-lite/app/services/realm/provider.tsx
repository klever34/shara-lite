import Realm from 'realm';
import React, {
  createContext,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {getLocalLastSync} from '@/services/realm/utils/sync-storage';

type modelUpdatesType = {
  [key: string]: number;
};

type RealmObject = {
  realm: Realm | undefined;
  realmUser: any;
  localRealm: MutableRefObject<Realm | undefined>;
  syncRealm: MutableRefObject<Realm | undefined>;
  isSyncCompleted: Boolean;
  isSyncInProgress: Boolean;
  modelUpdates: modelUpdatesType;
  setRealm: (realm: Realm | undefined) => void;
  setRealmUser: (realmUser: any) => void;
  setIsSyncInProgress: (isLoaded: Boolean) => void;
  setIsSyncCompleted: (isLoaded: Boolean) => void;
  setModelUpdates: (modelUpdates: modelUpdatesType) => void;
};

const noop = () => {};

export const RealmContext = createContext<RealmObject>({
  realm: undefined,
  realmUser: undefined,
  localRealm: (undefined as unknown) as MutableRefObject<Realm>,
  syncRealm: (undefined as unknown) as MutableRefObject<Realm>,
  isSyncCompleted: false,
  isSyncInProgress: false,
  modelUpdates: {},
  setRealm: noop,
  setRealmUser: noop,
  setIsSyncInProgress: noop,
  setIsSyncCompleted: noop,
  setModelUpdates: noop,
});

const RealmProvider = (props: any) => {
  const [isSyncInProgress, setIsSyncInProgress] = useState<Boolean>(false);
  const [isSyncCompleted, setIsSyncCompleted] = useState<Boolean>(true);
  const [realm, setRealm] = useState<Realm>();
  const [realmUser, setRealmUser] = useState<any>(false);
  const [modelUpdates, setModelUpdates] = useState<modelUpdatesType>({});
  const syncRealm = useRef<Realm>();
  const localRealm = useRef<Realm>();

  const updateSyncCompleteStatus = useCallback(async () => {
    const storedSyncDate = await getLocalLastSync();

    if (!storedSyncDate) {
      setIsSyncCompleted(false);
    }
  }, [setIsSyncCompleted]);

  useEffect(() => {
    updateSyncCompleteStatus().then(noop);
  }, [updateSyncCompleteStatus]);

  return (
    <RealmContext.Provider
      value={{
        realm,
        realmUser,
        syncRealm,
        localRealm,
        isSyncCompleted,
        isSyncInProgress,
        modelUpdates,
        setRealm,
        setRealmUser,
        setIsSyncInProgress,
        setIsSyncCompleted,
        setModelUpdates,
      }}>
      {props.children}
    </RealmContext.Provider>
  );
};

export default RealmProvider;
