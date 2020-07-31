import capitalize from 'lodash/capitalize';

export interface IContact
  extends Pick<User, 'firstname' | 'lastname' | 'mobile' | 'id'> {
  fullName: string;
  channel?: string;
  groups?: string;
  isMe: boolean;
}

export class Contact implements Partial<IContact> {
  public static schema: Realm.ObjectSchema = {
    name: 'Contact',
    primaryKey: 'mobile',
    properties: {
      id: 'int',
      mobile: 'string',
      channel: 'string?',
      groups: 'string?',
      isMe: 'bool',
      firstname: 'string',
      lastname: 'string',
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
