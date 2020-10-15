import Realm from 'realm';
import {shouldUpdateRealmObject} from '@/services/realm/utils';
import {addItemToQueue} from '@/services/realm/queue';

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

          addItemToQueue(() => {
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
              const insertItem = () => {
                targetRealm.create(
                  modelName,
                  insertedRecord,
                  Realm.UpdateMode.Modified,
                );
              };

              if (targetRealm.isInTransaction) {
                insertItem();
              } else {
                targetRealm.write(insertItem);
              }
            }
          });
        });

        changes.modifications.forEach((index: number) => {
          const modifiedRecord = records[index];

          addItemToQueue(() => {
            const updateRealmObject = shouldUpdateRealmObject({
              sourceObject: modifiedRecord,
              targetRealm,
              modelName,
            });

            if (
              modifiedRecord._partition &&
              modifiedRecord._partition === partitionValue &&
              updateRealmObject
            ) {
              const modifyItem = () => {
                targetRealm.create(
                  modelName,
                  modifiedRecord,
                  Realm.UpdateMode.Modified,
                );
              };

              if (targetRealm.isInTransaction) {
                modifyItem();
              } else {
                targetRealm.write(modifyItem);
              }
            }
          });
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
