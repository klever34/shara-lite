import {ObjectId} from 'bson';

let partitionKey = '';

export const getBaseModelValues = () => {
  return {
    _id: new ObjectId(),
    _partition: partitionKey,
    created_at: new Date(),
    updated_at: new Date(),
  };
};

export const setPartitionKey = async ({key}: {key: string}): Promise<void> => {
  partitionKey = key;
};
