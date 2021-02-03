interface RemoteConfig {
  translations: Translations;
  countries: Countries;
  minimumVersion: string;
}

interface Countries {
  NGN: CountryLocale;
}

interface CountryLocale {
  default: string;
  options: {code: string; name: string}[];
}
