import Realm from 'realm';
import {ICredit} from 'app-v2/models/Credit';

export const normalizeDb = ({
  partitionKey,
  realm,
}: {
  partitionKey: string;
  realm: Realm;
}) => {
  realm.write(() => {
    const credits = realm.objects<ICredit>('Credit');
    credits.forEach((credit) => {
      credit.fulfilled = !!credit.fulfilled;
    });

    const schema = realm.schema;
    schema.forEach((objSchema) => {
      const allObjects = realm.objects(objSchema.name);
      allObjects.forEach((obj: any) => {
        obj.is_deleted != true;

        if (!obj._partition) {
          obj._partition = partitionKey;
        }
      });
    });
  });
};
