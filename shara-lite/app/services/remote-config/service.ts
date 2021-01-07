import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';

const remoteConfigDefaults: RemoteConfig = {
  locales: {
    en: {
      login: {
        heading: 'Get Started For Free',
        subheading: 'Log in to auto-backup and sync your data securely',
        login_button: 'Next',
        forgot_password: 'Forgot your password?',
      },
      otp: {
        heading: 'OTP',
        subheading: '=== From API response ===',
        otp_button: 'Get Started',
        resend_text: "Didn't receive the code?",
        resend_button: 'Resend Code',
      },
      forgot_password: {
        heading: 'Forgot your password?',
        subheading: 'Enter your mobile number to receive your OTP',
        fp_button: 'Submit',
      },
      fields: {
        phone_field: {
          label: "What's your phone number?",
          placeholder: 'Enter your number',
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
    return remoteConfig().getValue(key);
  }
}
