import Realm from 'realm';

export const syncLocalRealm = ({
  localRealm,
  syncRealm,
}: {
  localRealm: Realm;
  syncRealm: Realm;
}) => {
  localRealm.schema.forEach((objSchema) => {
    const modelName = objSchema['name'];
    const collectionListenerRetainer = localRealm.objects(modelName);

    // @ts-ignore
    function listener(records, changes) {
      changes.insertions.forEach((index: number) => {
        const insertedRecord = records[index];
        syncRealm.write(() => {
          syncRealm.create(
            modelName,
            insertedRecord,
            Realm.UpdateMode.Modified,
          );
        });
      });

      changes.modifications.forEach((index: number) => {
        const modifiedRecord = records[index];
        syncRealm.write(() => {
          syncRealm.create(
            modelName,
            modifiedRecord,
            Realm.UpdateMode.Modified,
          );
        });
      });

      // @ts-ignore
      changes.deletions.forEach((index) => {
        // Deleted objects cannot be accessed directly
        // Support for accessing deleted objects coming soon...
      });
    }

    // @ts-ignore
    collectionListenerRetainer.addListener(listener);
  });
};
