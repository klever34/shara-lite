import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

const remoteConfigDefaults: RemoteConfig = {
  locales: {
    en: {
      next: 'next',
      skip: 'skip',
      get_started: 'Get Started',
      welcome: {},
      login: {
        heading: 'Get Started For Free',
        subheading: 'Log in to auto-backup and sync your data securely',
        login_button: 'Next',
        forgot_password: 'Forgot your password?',
      },
      register: {
        header: 'Sign up',
        heading: 'Get Started For Free',
        subheading:
          'Sign up and enjoy all the features available on Shara. It only takes a few moments.',
        submit_button: 'Sign Up',
        have_account: 'Already have an account?',
        sign_in: 'Sign In',
      },
      otp: {
        heading: 'OTP',
        subheading: '=== From API response ===',
        otp_resent: 'OTP RESENT',
        otp_button: 'Get Started',
        resend_text: "Didn't receive the code?",
        resend_button: 'Resend Code',
      },
      forgot_password: {
        heading: 'Forgot your password?',
        subheading: 'Enter your mobile number to receive your OTP',
        fp_button: 'Submit',
      },
      reset_password: {
        header: 'Reset your password',
        heading: 'Reset your password',
        password_match: 'Passwords do not match',
        submit_button: 'submit',
        otp_label: 'OTP',
        password_label: 'Enter you new password',
        repeat_password_label: 'Enter your password again',
      },
      fields: {
        phone: {
          label: "What's your phone number?",
          placeholder: 'Enter your number',
        },
        password: {
          label: 'Enter your password',
        },
        confirm_password: {
          label: 'Confirm password',
        },
      },
      alert: {
        minimum_phone_digits: 'Number should be minimum of 5 digits',
        error: 'Error',
        select_country: 'Please select a country',
        password_match: 'Passwords must match',
        required: {
          number: 'Number is required',
          password: 'Password is required',
          otp: 'OTP is required',
        },
      },
    },
  },
  countries: {
    ng: {
      default: 'en',
      options: ['hausa', 'yoruba', 'igbo'],
    },
  },
  minimumVersion: '0.1.0',
};

export interface IRemoteConfigService {
  initialize(): Promise<void>;
  getValue(key: keyof RemoteConfig): FirebaseRemoteConfigTypes.ConfigValue;
}

export class RemoteConfigService implements IRemoteConfigService {
  async initialize(): Promise<void> {
    return remoteConfig()
      .setDefaults({
        minimumVersion: remoteConfigDefaults.minimumVersion,
        locales: JSON.stringify(remoteConfigDefaults.locales),
      })
      .then(() => remoteConfig().fetchAndActivate())
      .then((fetchedRemotely) => {
        if (fetchedRemotely) {
          console.log('Configs were retrieved from the backend and activated.');
        } else {
          console.log(
            'No configs were fetched from the backend, and the local configs were already activated',
          );
        }
      });
  }

  getValue(key: keyof RemoteConfig): FirebaseRemoteConfigTypes.ConfigValue {
    return {
      getSource() {
        return 'default';
      },
      asNumber() {
        return 0;
      },
      asBoolean() {
        return false;
      },
      asString() {
        return JSON.stringify(remoteConfigDefaults[key]);
      },
    };
    // return remoteConfig().getValue(key);
  }
}
