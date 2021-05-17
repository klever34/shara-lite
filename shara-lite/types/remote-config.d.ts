interface RemoteConfig {
  translations: Translations;
  countries: Countries;
  minimumVersion: string;
  sharaMoneyEnabledCountries: {[key: string]: {maxWithdrawalAmount?: number}};
  sharaMoneyEnabledUsers: {[key: string]: {id: string; name: string}};
  enableBVNVerification: boolean;
}

interface Countries {
  [key: string]: CountryLocale;
}

interface CountryLocale {
  default: string;
  options: {code: string; name: string}[];
}
