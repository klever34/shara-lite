import {useRealm} from '@/services/realm';
import {UpdateMode} from 'realm';
import {ObjectId} from 'bson';
import perf from '@react-native-firebase/perf';
import {IBNPLApproval, modelName} from '@/models/BNPLApproval';

interface saveBNPLApprovalInterface {
  bnplApproval: IBNPLApproval;
}

interface useBNPLApprovalInterface {
  getBNPLApproval: () => IBNPLApproval | undefined;
  saveBNPLApproval: (data: saveBNPLApprovalInterface) => Promise<IBNPLApproval>;
}

export const useBNPLApproval = (): useBNPLApprovalInterface => {
  const realm = useRealm();

  const getBNPLApproval = (): IBNPLApproval | undefined => {
    const bnplApprovals = realm.objects<IBNPLApproval>(modelName);
    return bnplApprovals.length ? bnplApprovals[0] : undefined;
  };

  const saveBNPLApproval = async ({
    bnplApproval,
  }: saveBNPLApprovalInterface): Promise<IBNPLApproval> => {
    const updatedBNPLApproval: IBNPLApproval = {
      ...bnplApproval,
      _id: new ObjectId(bnplApproval._id),
    };

    const trace = await perf().startTrace('saveBNPLApproval');
    realm.write(() => {
      realm.create<IBNPLApproval>(
        modelName,
        updatedBNPLApproval,
        UpdateMode.Modified,
      );
    });
    await trace.stop();

    return updatedBNPLApproval;
  };

  return {
    getBNPLApproval,
    saveBNPLApproval,
  };
};
