import {ObjectId} from 'bson';
import {StorageService} from '../services/storage';

let partitionKey = '';

export interface BaseModelInterface {
  _id?: ObjectId;
  _partition?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const baseModelSchema = {
  _id: {type: 'objectId', indexed: true},
  _partition: 'string',
  created_at: 'date?',
  updated_at: 'date?',
};

const getRealmPartitionKey = async (): Promise<void> => {
  const storageService = new StorageService();
  const user = await storageService.getItem('user');
  // @ts-ignore
  partitionKey = user ? user.id.toString() : '';
};

const getLocalRealmPartitionKey = () => {
  if (!partitionKey) {
    getRealmPartitionKey().then();
  }
  return partitionKey;
};

export class BaseModel {
  public _id: ObjectId;
  public _partition: string;

  constructor({_id = new ObjectId()} = {}) {
    this._partition = getLocalRealmPartitionKey();
    this._id = _id;
  }
}
