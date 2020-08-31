import capitalize from 'lodash/capitalize';
import {User} from 'types/app';
import {BaseModel, BaseModelInterface, baseModelSchema} from './baseSchema';

export interface IContact
  extends Pick<User, 'firstname' | 'lastname' | 'mobile' | 'id'>,
    BaseModelInterface {
  channel?: string;
  groups: string;
  isMe: boolean;
  recordId?: string;

  readonly fullName: string;
}

export class Contact extends BaseModel implements Partial<IContact> {
  public static schema: Realm.ObjectSchema = {
    name: Contact.name,
    primaryKey: '_id',
    properties: {
      ...baseModelSchema,
      id: {type: 'int', indexed: true, optional: true},
      mobile: 'string?',
      firstname: 'string?',
      lastname: 'string?',
      channel: 'string?',
      groups: 'string?',
      isMe: 'bool?',
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
