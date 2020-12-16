import Config from 'react-native-config';

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
        mobile: '8056636694',
        password: 'some-password',
        countryCode: '234',
      },
      supplier: {
        name: 'James',
        address: 'Harden',
        mobile: '+2348056636694',
      },
      deliveryAgent: {
        full_name: 'Sundai Pichai',
        mobile: '+2348056636694',
      },
      quantity: '100',
      newProduct: {
        name: 'Hollandia Yoghurt',
        price: 5000,
        sku: 'HY',
      },
      newCustomerName: 'Kepa Allison',
      newCustomerMobile: '+2348056636694',
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
