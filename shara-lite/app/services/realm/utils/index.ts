import Realm from 'realm';
import {BaseModelInterface} from '@/models/baseSchema';

export const shouldUpdateRealmObject = ({
  sourceObject,
  targetRealm,
  modelName,
}: {
  sourceObject: any;
  targetRealm: Realm;
  modelName: string;
}): boolean => {
  if (!sourceObject.isValid()) {
    return false;
  }

  const targetRecord = targetRealm.objectForPrimaryKey(
    modelName,
    sourceObject._id,
  ) as BaseModelInterface & {isValid: () => boolean};

  if (targetRecord && !targetRecord.isValid()) {
    return false;
  }

  return (
    !targetRecord ||
    !targetRecord.updated_at ||
    new Date(sourceObject.updated_at) > new Date(targetRecord.updated_at)
  );
};
