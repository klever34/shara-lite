export const getRealmObjectCopy = ({
  obj,
  objSchema,
  extracObjectId,
}: {
  obj: any;
  objSchema: any;
  extracObjectId?: boolean;
}) => {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.type !== 'linkingObjects') {
      if (extracObjectId && obj[key] && obj[key]._id) {
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
