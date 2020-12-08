import {getApiService} from '@/services';
import {getLastModelSync} from '@/services/realm/utils/sync-storage';
import {isBackgroundSyncCompleted} from '@/services/realm/utils/queue';
import {useContext} from 'react';
import {RealmContext} from '@/services/realm/provider';

export const useSyncChecks = () => {
  const {realmUser} = useContext(RealmContext);

  const hasAllRecordsBeenSynced = async (): Promise<{
    isSynced: boolean;
  }> => {
    const apiService = getApiService();

    if (!realmUser || !isBackgroundSyncCompleted()) {
      return {isSynced: false};
    }

    const lastModelSync = await getLastModelSync();
    if (!lastModelSync) {
      return {isSynced: true};
    }

    const {model, _id, updated_at} = lastModelSync;

    const syncedRecord = await apiService.getSyncedRecord({model, _id});
    if (!syncedRecord) {
      return {isSynced: false};
    }

    try {
      const isSynced =
        new Date(updated_at) <= new Date(syncedRecord.updated_at || '');
      return {isSynced};
    } catch (e) {
      return {isSynced: false};
    }
  };

  return {
    hasAllRecordsBeenSynced,
  };
};
