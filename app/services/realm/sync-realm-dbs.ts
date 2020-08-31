import Realm from 'realm';

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
      changes.insertions.forEach((index: number) => {
        const insertedRecord = records[index];
        targetRealm.write(() => {
          if (
            insertedRecord._partition &&
            insertedRecord._partition === partitionValue
          ) {
            targetRealm.create(
              modelName,
              insertedRecord,
              Realm.UpdateMode.Modified,
            );
          }
        });
      });

      changes.modifications.forEach((index: number) => {
        const modifiedRecord = records[index];
        targetRealm.write(() => {
          if (
            modifiedRecord._partition &&
            modifiedRecord._partition === partitionValue
          ) {
            targetRealm.create(
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
