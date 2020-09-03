import Config from 'react-native-config';
import faker from 'faker';

export class FormDefaults {
  private static testDefaults() {
    return {
      login: {
        mobile: '8056636694',
        password: 'some-password',
        countryCode: '234',
      },
      signup: {
        firstname: faker.name.firstName(),
        lastname: faker.name.lastName(),
        mobile: '8056636694',
        password: 'some-password',
        countryCode: '234',
      },
      supplier: {
        name: faker.name.findName(),
        address: faker.address.streetAddress(),
        mobile: faker.phone.phoneNumber(),
      },
      quantity: `${Math.floor(Math.random() * 100)}`,
      newProduct: {
        name: faker.commerce.productName(),
        price: faker.random.number(),
        sku: faker.commerce.product(),
      },
      newCustomerName: faker.name.findName(),
      newCustomerMobile: faker.phone.phoneNumber(),
    };
  }

  static get(section: string, defaultValue: any = {}): any {
    const defaults = this.testDefaults();
    return Config.CI_TESTS === 'true'
      ? // @ts-ignore
        defaults[section]
      : defaultValue;
  }
}
