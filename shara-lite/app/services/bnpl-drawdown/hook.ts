import {useRealm} from '@/services/realm';
import {IBNPLDrawdown, modelName} from '@/models/BNPLDrawdown';
import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import perf from '@react-native-firebase/perf';
import { useCustomer } from '../customer/hook';
import { useReceipt } from '../receipt';

interface saveBNPLDrawdownInterface {
  bnplDrawdown: Omit<IBNPLDrawdown, 'customer' | 'receipt'> & {
    customer: ObjectId;
    receipt: ObjectId;
  };
}

interface getBNPLDrawdownInterface {
  bnplDrawdownId: ObjectId;
}
interface useBNPLDrawdownInterface {
  getBNPLDrawdowns: () => Realm.Results<IBNPLDrawdown & Realm.Object>;
  getBNPLDrawdown: (data: getBNPLDrawdownInterface) => IBNPLDrawdown;
  saveBNPLDrawdown: (
    data: saveBNPLDrawdownInterface,
  ) => Promise<IBNPLDrawdown>;
}

export const useBNPLDrawdown = (): useBNPLDrawdownInterface => {
  const realm = useRealm();
  const {getCustomer} = useCustomer();
  const {getReceipt} = useReceipt();
  const getBNPLDrawdowns = (): Realm.Results<IBNPLDrawdown & Realm.Object> => {
    return realm
      .objects<IBNPLDrawdown>(modelName)
      .filtered('is_deleted != true');
  };

  const getBNPLDrawdown = ({bnplDrawdownId}: getBNPLDrawdownInterface ) => {
    return realm.objectForPrimaryKey(modelName, bnplDrawdownId) as IBNPLDrawdown;
  };

  const saveBNPLDrawdown = async ({
    bnplDrawdown,
  }: saveBNPLDrawdownInterface): Promise<IBNPLDrawdown> => {
    const customer = bnplDrawdown.customer && getCustomer({customerId: new ObjectId(bnplDrawdown.customer)});
    const receipt = bnplDrawdown.receipt && getReceipt({receiptId: new ObjectId(bnplDrawdown.receipt)});

    const updatedBNPLDrawdown: IBNPLDrawdown = {
      ...bnplDrawdown,
      _id: new ObjectId(bnplDrawdown._id),
      customer,
      receipt,
    };

    const trace = await perf().startTrace('saveBNPLDrawdown');
    realm.write(() => {
      realm.create<IBNPLDrawdown>(
        modelName,
        updatedBNPLDrawdown,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    return updatedBNPLDrawdown;
  };


  return {
    getBNPLDrawdown,
    getBNPLDrawdowns,
    saveBNPLDrawdown,
  };
};
