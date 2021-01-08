interface RemoteConfig {
  locales: Locales;
  countries: Countries;
  minimumVersion: string;
}

interface Locales {
  en: Strings;
}

interface Strings {
  update_shara: {
    title: string;
    description: string;
    submit_button: string;
  };
  next: string;
  skip: string;
  get_started: string;
  welcome: {};
  login: {
    heading: string;
    subheading: string;
    login_button: string;
    forgot_password: string;
  };
  register: {
    header: string;
    heading: string;
    subheading: string;
    submit_button: string;
    have_account: string;
    sign_in: string;
  };
  otp: {
    heading: string;
    subheading: string;
    otp_resent: string;
    otp_button: string;
    resend_text: string;
    resend_button: string;
  };
  forgot_password: {
    heading: string;
    subheading: string;
    fp_button: string;
  };
  reset_password: {
    header: string;
    heading: string;
    password_match: string;
    submit_button: string;
    otp_label: string;
    password_label: string;
    repeat_password_label: string;
  };
  fields: {
    phone: FormField;
    password: FormField;
    confirm_password: FormField;
  };
  alert: {
    minimum_phone_digits: string;
    error: string;
    select_country: string;
    password_match: string;
    required: {
      number: string;
      password: string;
      otp: string;
    };
  };
}

interface FormField {
  label: string;
  placeholder?: string;
}

interface Countries {
  ng: CountryLocale;
}

interface CountryLocale {
  default: string;
  options?: string[];
}
