import Realm from 'realm';

const copyObject = ({
  obj,
  objSchema,
  targetRealm,
}: {
  obj: any;
  objSchema: any;
  targetRealm: Realm;
}) => {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.type !== 'linkingObjects') {
      // @ts-ignore
      copy[key] = obj[key];
    }
  }
  try {
    targetRealm.create(objSchema.name, copy, Realm.UpdateMode.Modified);
  } catch (e) {
    console.log('Error writing to realm sync', e);
  }
};

export const copyRealm = ({
  sourceRealm,
  targetRealm,
}: {
  sourceRealm: Realm;
  targetRealm: Realm;
}) => {
  const sourceRealmSchema = sourceRealm.schema;
  targetRealm.write(() => {
    sourceRealmSchema.forEach((objSchema) => {
      const allObjects = sourceRealm.objects(objSchema.name);

      allObjects.forEach((obj: any) => {
        if (obj._partition) {
          copyObject({obj, objSchema, targetRealm});
        }
      });
    });
  });
};
