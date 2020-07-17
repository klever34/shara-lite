import capitalize from 'lodash/capitalize';

export interface IContact
  extends Pick<User, 'firstname' | 'lastname' | 'mobile'> {
  fullName: string;
  channel?: string;
}

export class Contact implements Partial<IContact> {
  public static schema: Realm.ObjectSchema = {
    name: 'Contact',
    primaryKey: 'mobile',
    properties: {
      mobile: 'string',
      channel: 'string?',
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
