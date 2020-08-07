import {ObjectId} from 'bson';
import {getRealmPartitionKey} from '../services/realm';

export interface BaseModelInterface {
  _id?: ObjectId;
  _partition?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const baseModelSchema = {
  _id: {type: 'string', indexed: true},
  _partition: 'string',
  created_at: 'date?',
  updated_at: 'date?',
};

export class BaseModel {
  public _id: ObjectId;
  public _partition: string;

  constructor({id = new ObjectId()} = {}) {
    this._partition = getRealmPartitionKey();
    this._id = id;
  }
}
