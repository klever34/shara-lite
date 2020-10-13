import Realm from 'realm';
import {shouldUpdateRealmObject} from '@/services/realm/utils';

export const syncRealmDbs = ({
  sourceRealm,
  targetRealm,
  partitionValue,
}: {
  sourceRealm: Realm;
  targetRealm: Realm;
  partitionValue: string;
}) => {
  sourceRealm.schema.forEach((objSchema) => {
    const modelName = objSchema.name;
    const collectionListenerRetainer = sourceRealm.objects(modelName);

    // @ts-ignore
    function listener(records, changes) {
      const updateRecords = () => {
        changes.insertions.forEach((index: number) => {
          const insertedRecord = records[index];
          const insertRealmObject = shouldUpdateRealmObject({
            sourceObject: insertedRecord,
            targetRealm,
            modelName,
          });

          if (
            insertedRecord._partition &&
            insertedRecord._partition === partitionValue &&
            insertRealmObject
          ) {
            targetRealm.create(
              modelName,
              insertedRecord,
              Realm.UpdateMode.Modified,
            );
          }
        });

        changes.modifications.forEach((index: number) => {
          const modifiedRecord = records[index];
          const updateRealmObject = shouldUpdateRealmObject({
            sourceObject: modifiedRecord,
            targetRealm,
            modelName,
          });
          console.log(updateRealmObject, modifiedRecord.updated_at);

          if (
            modifiedRecord._partition &&
            modifiedRecord._partition === partitionValue &&
            updateRealmObject
          ) {
            targetRealm.create(
              modelName,
              modifiedRecord,
              Realm.UpdateMode.Modified,
            );
          }
        });

        // @ts-ignore
        changes.deletions.forEach(() => {
          // Deleted objects cannot be accessed directly
          // Support for accessing deleted objects coming soon...
        });
      };

      setTimeout(() => {
        if (targetRealm.isInTransaction) {
          updateRecords();
        } else {
          targetRealm.write(updateRecords);
        }
      }, 1000);
    }

    // @ts-ignore
    collectionListenerRetainer.addListener(listener);
  });
};
