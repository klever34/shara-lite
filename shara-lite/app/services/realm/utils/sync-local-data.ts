import Realm from 'realm';
import {copyRealm} from '@/services/realm/utils/copy-realm';
import {syncRealmDbs} from '@/services/realm/utils/sync-realm-dbs';
import {normalizeDb} from '@/services/realm/utils/normalizations';

export const syncLocalData = ({
  syncRealm,
  localRealm,
  partitionValue,
  lastLocalSync,
  onModelUpdate,
}: {
  syncRealm?: Realm;
  localRealm?: Realm;
  partitionValue: string;
  lastLocalSync: any | undefined;
  onModelUpdate: (name: string) => void;
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
    onModelUpdate,
  });
};
