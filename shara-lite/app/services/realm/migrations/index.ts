import Realm from 'realm';
import schemas from '@/services/realm/migrations/schemas';

export const runMigration = ({currentSchema}: {currentSchema: any}) => {
  if (!schemas.length) {
    return {schemaVersion: 0};
  }

  let nextSchemaIndex = Realm.schemaVersion(Realm.defaultPath);
  schemas[schemas.length - 1].schema = currentSchema;

  // If -1, it means this is a new Realm file, so no migration is needed
  if (nextSchemaIndex !== -1) {
    while (nextSchemaIndex < schemas.length) {
      const migratedRealm = new Realm(schemas[nextSchemaIndex++]);
      migratedRealm.close();
    }
  }

  return {schemaVersion: schemas[schemas.length - 1].schemaVersion};
};
