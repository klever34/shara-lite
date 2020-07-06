export interface IContact
  extends Pick<User, 'firstname' | 'lastname' | 'mobile' | 'id'> {}

export class Contact implements Partial<IContact> {
  public static schema: Realm.ObjectSchema = {
    name: 'Contact',
    properties: {
      id: 'int',
      firstname: 'string',
      lastname: 'string',
      mobile: 'string',
    },
  };
}
