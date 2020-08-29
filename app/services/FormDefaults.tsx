import Config from 'react-native-config';
import faker from 'faker';

export class FormDefaults {
  private static testDefaults: any = {
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
    receipt: {},
    quantity: `${Math.floor(Math.random() * 100)}`,
    newProduct: {
      name: faker.commerce.productName(),
      price: faker.random.number(),
      sku: faker.commerce.product(),
    },
    newCustomerName: faker.name.findName(),
    newCustomerMobile: faker.phone.phoneNumber(),
  };

  private static appDefaults: any = {
    login: {},
    signup: {},
    newProduct: {},
    quantity: '',
  };

  static get(section: string): any {
    return Config.CI_TESTS === 'true'
      ? this.testDefaults[section]
      : this.appDefaults[section];
  }
}
