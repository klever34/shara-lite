import Realm from 'realm';
import {ICredit} from '@/models/Credit';
import {IReceipt} from '@/models/Receipt';

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

    const receipts = realm
      .objects<IReceipt>('Receipt')
      .filtered('transaction_date = null');
    receipts.forEach((receipt) => {
      if (receipt && !receipt.transaction_date) {
        receipt.transaction_date = receipt.created_at;
      }
    });

    const schema = realm.schema;
    schema.forEach((objSchema) => {
      const allObjects = realm.objects(objSchema.name);
      allObjects.forEach((obj: any) => {
        if (!obj._partition) {
          obj._partition = partitionKey;
        }
      });
    });
  });
};
