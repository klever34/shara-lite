export interface IContact
  extends Pick<User, 'firstname' | 'lastname' | 'mobile'> {
  fullName: string;
}

export class Contact implements Partial<IContact> {
  public static schema: Realm.ObjectSchema = {
    name: 'Contact',
    primaryKey: 'mobile',
    properties: {
      mobile: 'string',
      firstname: 'string',
      lastname: 'string',
    },
  };
  public firstname: string | undefined;
  public lastname: string | undefined;
  public get fullName() {
    let name = this.firstname;
    if (this.lastname) {
      name += ' ' + this.lastname;
    }
    return name;
  }
}
