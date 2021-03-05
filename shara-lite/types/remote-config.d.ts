interface RemoteConfig {
  translations: Translations;
  countries: Countries;
  minimumVersion: string;
  sharaMoneyEnabledCountries: {[key: string]: {}};
}

interface Countries {
  [key: string]: CountryLocale;
}

interface CountryLocale {
  default: string;
  options: {code: string; name: string}[];
}
