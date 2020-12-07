import {ObjectId} from 'bson';

let partitionKey = '';

export interface BaseModelInterface extends Partial<Realm.Object> {
  _id?: ObjectId;
  _partition?: string;
  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const baseModelSchema = {
  _id: {type: 'objectId', indexed: true},
  _partition: 'string',
  is_deleted: {type: 'bool', default: false, optional: true},
  created_at: 'date?',
  updated_at: 'date?',
};

export const setRealmPartitionKey = (newPartitionKey: string) => {
  // @ts-ignore
  partitionKey = newPartitionKey;
};

export class BaseModel {
  public _id: ObjectId;
  public _partition: string;

  constructor({_id = new ObjectId()} = {}) {
    this._partition = partitionKey;
    this._id = _id;
  }
}
