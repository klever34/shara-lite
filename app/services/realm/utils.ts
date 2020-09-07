export const getRealmObjectCopy = ({
  obj,
  objSchema,
}: {
  obj: any;
  objSchema: any;
}) => {
  const copy = {};
  for (let key in objSchema.properties) {
    const prop = objSchema.properties[key];
    if (prop.type !== 'linkingObjects') {
      // @ts-ignore
      copy[key] = obj[key];
    }
  }
  return copy;
};
