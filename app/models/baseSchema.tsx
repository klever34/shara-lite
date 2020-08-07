import {ObjectId} from 'bson';
import {getAuthService} from '../services';

const authService = getAuthService();

export interface BaseModelInterface {
  _id?: ObjectId;
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
  protected _partition: string | undefined;

  constructor({id = new ObjectId()}) {
    const user = authService.getUser();
    this._partition = user?.id.toString();
    this._id = id;
  }
}
