import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

const remoteConfigDefaults: RemoteConfig = {
  locales: {
    en: {
      update_shara: {
        title: 'Update Shara',
        description:
          'A new version of the app is now available. Update now see what’s new',
        submit_button: 'Update Now',
      },
      next: 'next',
      skip: 'skip',
      get_started: 'Get Started',
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
        subheading: '{{From API response}}',
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
        something_went_wrong: 'Oops! Something went wrong.',
        clear_app_data: 'Try clearing app data from application settings',
        ok: 'OK',
        sync: {
          title: 'Sync in progress',
          description:
            'We are syncing your data across the Shara app. This might take a few seconds.',
        },
      },
      shara_tagline: 'Keep track of who owes you and get paid faster',
      onboarding_copy_1: {
        title: 'Get repaid before you get desperate',
        description: 'Get repayments from your customers 3X faster',
      },
      onboarding_copy_2: {
        title:
          'Never forget to send reminders to your customers with our free reminders & notifications',
        description: 'Free SMS & WhatsApp reminders to your customers',
      },
      onboarding_copy_3: {
        title: 'You and your business - as one',
        description:
          'Take control of your trade and bring it to the next level',
      },
    },
  },
  countries: {
    ng: {
      default: 'en',
      options: ['hausa', 'yoruba', 'igbo'],
    },
  },
  minimumVersion: '0.1.0-local',
};

// console.log(
//   (() => {
//     const {locales} = remoteConfigDefaults;
//     return JSON.stringify(locales);
//   })(),
// );

// console.log(
//   (() => {
//     const generate = (object: {[key: string]: any}, prefix = '') => {
//       let file = '';
//       Object.keys(object).forEach((name) => {
//         const key = `${prefix}${prefix ? '.' : ''}${name}`;
//         const value = object[name];
//         if (typeof value === 'string') {
//           file += `${key},`;
//           file += `${value}\n`;
//         } else if (typeof value === 'object') {
//           file += generate(value, key);
//         }
//       });
//       return file;
//     };
//     const {locales} = remoteConfigDefaults;
//     let file = 'Key,';
//     Object.keys(locales).forEach((langCode) => {
//       file += langCode;
//     });
//     file += '\n';
//     return file + generate(locales.en);
//   })(),
// );

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
      asString(): string {
        return JSON.stringify(remoteConfigDefaults[key]);
      },
      getSource(): 'remote' | 'default' | 'static' {
        return 'default';
      },
      asNumber(): number {
        return 0;
      },
      asBoolean(): boolean {
        return false;
      },
    };
    // return remoteConfig().getValue(key);
  }
}
