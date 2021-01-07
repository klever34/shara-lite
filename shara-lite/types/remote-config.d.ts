interface RemoteConfig {
  locales: Locales;
  countries: Countries;
  minimumVersion: string;
}

interface Locales {
  en: Strings;
}

interface Strings {
  login: {
    heading: string;
    subheading: string;
    login_button: string;
    forgot_password: string;
  };
  otp: {
    heading: string;
    subheading: string;
    otp_button: string;
    resend_text: string;
    resend_button: string;
  };
  forgot_password: {
    heading: string;
    subheading: string;
    fp_button: string;
  };
  fields: {
    phone_field: {
      label: string;
      placeholder: string;
    };
  };
}

interface Countries {
  ng: CountryLocale;
}

interface CountryLocale {
  default: string;
  options?: string[];
}
