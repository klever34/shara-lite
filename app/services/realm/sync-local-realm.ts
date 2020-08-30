import Realm from 'realm';

export const syncLocalRealm = ({
  localRealm,
  syncRealm,
  partitionValue,
}: {
  localRealm: Realm;
  syncRealm: Realm;
  partitionValue: string;
}) => {
  localRealm.schema.forEach((objSchema) => {
    const modelName = objSchema.name;
    const collectionListenerRetainer = localRealm.objects(modelName);

    // @ts-ignore
    function listener(records, changes) {
      changes.insertions.forEach((index: number) => {
        const insertedRecord = records[index];

        syncRealm.write(() => {
          if (
            insertedRecord._partition &&
            insertedRecord._partition === partitionValue
          ) {
            syncRealm.create(
              modelName,
              insertedRecord,
              Realm.UpdateMode.Modified,
            );
          }
        });
      });

      changes.modifications.forEach((index: number) => {
        const modifiedRecord = records[index];

        syncRealm.write(() => {
          if (
            modifiedRecord._partition &&
            modifiedRecord._partition === partitionValue
          ) {
            syncRealm.create(
              modelName,
              modifiedRecord,
              Realm.UpdateMode.Modified,
            );
          }
        });
      });

      // @ts-ignore
      changes.deletions.forEach(() => {
        // Deleted objects cannot be accessed directly
        // Support for accessing deleted objects coming soon...
      });
    }

    // @ts-ignore
    collectionListenerRetainer.addListener(listener);
  });
};
