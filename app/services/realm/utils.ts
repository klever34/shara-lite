export const getRealmObjectCopy = ({
  obj,
  objSchema,
  extractObjectId,
}: {
  obj: any;
  objSchema: any;
  extractObjectId?: boolean;
}) => {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.type !== 'linkingObjects') {
      if (extractObjectId && obj[key] && obj[key]._id) {
        // @ts-ignore
        copy[key] = obj[key]._id;
      } else {
        // @ts-ignore
        copy[key] = obj[key];
      }
    }
  }
  return copy;
};
