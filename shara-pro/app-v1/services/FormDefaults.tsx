import Config from 'react-native-config';
import faker from 'faker';

export class FormDefaults {
  /**
   * Test fixtures to be used for Firebase Test Lab
   *
   * @private
   */
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
      deliveryAgent: {
        full_name: faker.name.findName(),
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

  /**
   * Returns test values if CI_TESTS=true and defaultValue if CI_TESTS=false
   *
   * @param section - Section of app
   * @param {*} [defaultValue={}] - Default value return if CI_TESTS=false
   */
  static get(section: string, defaultValue: any = {}): any {
    const defaults = this.testDefaults();
    return Config.CI_TESTS === 'true'
      ? // @ts-ignore
        defaults[section]
      : defaultValue;
  }
}
