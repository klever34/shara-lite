import capitalize from 'lodash/capitalize';
import {User} from '../../types/app';
import {BaseModel, baseModelSchema} from './baseSchema';

export interface IContact
  extends Pick<User, 'firstname' | 'lastname' | 'mobile' | 'id'> {
  fullName: string;
  channel?: string;
  groups: string;
  isMe: boolean;
}

export class Contact extends BaseModel implements Partial<IContact> {
  public static schema: Realm.ObjectSchema = {
    name: 'Contact',
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      id: {type: 'int', indexed: true, optional: true},
      mobile: 'string?',
      channel: 'string?',
      groups: 'string?',
      isMe: 'bool?',
      firstname: 'string?',
      lastname: 'string?',
      recordId: 'string?',
    },
  };
  public firstname: string | undefined;
  public lastname: string | undefined;
  public get fullName() {
    let name = capitalize(this.firstname);
    if (this.lastname) {
      name += ' ' + capitalize(this.lastname);
    }
    return name;
  }
}
