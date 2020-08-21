// Copy local realm to ROS
// @ts-nocheck

import {omit} from 'lodash';
import Realm from 'realm';

const copyObject = function (obj, objSchema, targetRealm) {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (!prop.hasOwnProperty('objectType')) {
      copy[key] = obj[key];
    }
  }

  try {
    targetRealm.create(objSchema.name, copy, Realm.UpdateMode.Modified);
  } catch (e) {
    console.log('Error writing to realm sync', e);
  }
};

const getMatchingObjectInOtherRealm = function (
  sourceObj,
  source_realm,
  target_realm,
  class_name,
) {
  const allObjects = source_realm.objects(class_name);
  const ndx = allObjects.indexOf(sourceObj);

  // Get object on same position in target realm
  return target_realm.objects(class_name)[ndx];
};

const addLinksToObject = function (
  sourceObj,
  targetObj,
  objSchema,
  source_realm,
  target_realm,
) {
  for (var key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.hasOwnProperty('objectType')) {
      if (prop['type'] == 'list') {
        var targetList = targetObj[key];
        sourceObj[key].forEach((linkedObj) => {
          const obj = getMatchingObjectInOtherRealm(
            linkedObj,
            source_realm,
            target_realm,
            prop.objectType,
          );
          targetList.push(obj);
        });
      } else {
        // Find the position of the linked object
        const linkedObj = sourceObj[key];
        if (linkedObj === null) {
          continue;
        }

        // Set link to object on same position in target realm
        targetObj[key] = getMatchingObjectInOtherRealm(
          linkedObj,
          source_realm,
          target_realm,
          prop.objectType,
        );
      }
    }
  }
};

export const copyRealm22 = (source_realm, target_realm) => {
  // Open the local realm
  const source_realm_schema = source_realm.schema;

  target_realm.write(() => {
    // Copy all objects but ignore links for now
    source_realm_schema.forEach((objSchema) => {
      const allObjects = source_realm.objects(objSchema['name']);

      allObjects.forEach((obj) => {
        if (!obj._partition) {
          return;
        }
        copyObject(obj, objSchema, target_realm);
      });
    });

    // Do a second pass to add links
    source_realm_schema.forEach((objSchema) => {
      const allSourceObjects = source_realm.objects(objSchema['name']);
      const allTargetObjects = target_realm.objects(objSchema['name']);

      for (var i = 0; i < allSourceObjects.length; ++i) {
        const sourceObject = allSourceObjects[i];
        const targetObject = allTargetObjects[i];

        addLinksToObject(
          sourceObject,
          targetObject,
          objSchema,
          source_realm,
          target_realm,
        );
      }
    });
  });
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
