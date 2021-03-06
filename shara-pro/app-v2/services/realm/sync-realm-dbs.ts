import Realm from 'realm';
import {
  saveLastLocalSync,
  shouldUpdateRealmObject,
} from 'app-v2/services/realm/utils';
import {addItemToQueue} from 'app-v2/services/realm/queue';

export const syncRealmDbs = ({
  sourceRealm,
  targetRealm,
  partitionValue,
  isLocal,
}: {
  sourceRealm: Realm;
  targetRealm: Realm;
  partitionValue: string;
  isLocal?: boolean;
}) => {
  sourceRealm.schema.forEach((objSchema) => {
    const modelName = objSchema.name;
    const collectionListenerRetainer = sourceRealm.objects(modelName);

    // @ts-ignore
    function listener(records, changes) {
      changes.insertions.forEach((index: number) => {
        const insertedRecord = records[index];

        addItemToQueue(() => {
          const insertRealmObject = shouldUpdateRealmObject({
            sourceObject: insertedRecord,
            targetRealm,
            modelName,
          });

          if (
            insertRealmObject &&
            insertedRecord &&
            insertedRecord._partition &&
            insertedRecord._partition === partitionValue
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

            if (isLocal) {
              saveLastLocalSync({
                model: objSchema.name,
                date: insertedRecord.updated_at,
              }).then(() => {});
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
            updateRealmObject &&
            modifiedRecord &&
            modifiedRecord._partition &&
            modifiedRecord._partition === partitionValue
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

            if (isLocal) {
              saveLastLocalSync({
                model: objSchema.name,
                date: modifiedRecord.updated_at,
              }).then(() => {});
            }
          }
        });
      });
    }

    // @ts-ignore
    collectionListenerRetainer.addListener(listener);
  });
};
