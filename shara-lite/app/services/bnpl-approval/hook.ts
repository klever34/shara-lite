import {useRealm} from '@/services/realm';
import {IBNPLApproval, modelName} from '@/models/BNPLApproval';

interface useBNPLApprovalInterface {
  getBNPLApproval: () => IBNPLApproval | undefined;
}

export const useBNPLApproval = (): useBNPLApprovalInterface => {
  const realm = useRealm();
  const getBNPLApproval = (): IBNPLApproval | undefined => {
    const bnplApprovals = realm.objects<IBNPLApproval>(modelName);
    return bnplApprovals.length ? bnplApprovals[0] : undefined;
  };

  return {
    getBNPLApproval,
  };
};
