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

export const setBasePartitionKey = (key: string) => {
  partitionKey = key;
};
