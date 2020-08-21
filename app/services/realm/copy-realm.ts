// Copy local realm to ROS
// @ts-nocheck

import Realm from 'realm';

const copyObject = function (obj, objSchema, targetRealm) {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (!prop.type !== 'linkingObjects') {
      copy[key] = obj[key];
    }
  }
  try {
    targetRealm.create(objSchema.name, copy, Realm.UpdateMode.Modified);
  } catch (e) {
    console.log('Error writing to realm sync', e);
  }
};

export const copyRealm = (sourceRealm, targetRealm) => {
  const sourceRealmSchema = sourceRealm.schema;
  targetRealm.write(() => {
    sourceRealmSchema.forEach((objSchema) => {
      const allObjects = sourceRealm.objects(objSchema['name']);

      allObjects.forEach((obj) => {
        if (obj._partition) {
          copyObject(obj, objSchema, targetRealm);
        }
      });
    });
  });
};
