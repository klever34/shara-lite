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
        name: {
          label: 'Name',
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
        title: 'Get paid on time',
        description: 'Get paid 2.5 times faster with Shara',
      },
      onboarding_copy_2: {
        title: 'Send free reminders',
        description:
          'Send Free Professional Payment Reminders via SMS and WhatsApp',
      },
      onboarding_copy_3: {
        title: 'Keep track of your revenue and who owes you',
        description:
          'Securely record your business data in a private, secure and backed up',
      },
      activities: 'Activities',
      customer: {one: 'Customer', other: 'Customers'},
      payment_reminder: {
        title: 'Payment Reminder',
        message:
          'Hello {{customer_name}}! {{extra_salutation}}{{you_owe}}{{due_on}}.\n\n{{pay_at}}Powered by Shara for free.\nwww.shara.co',
        thank_you_for_doing_business:
          'Thank you for doing business with {{business_name}}. ',
        you_owe: 'You owe {{balance}}',
        due_on: ' which is due on {{due_date}}',
        pay_at: 'To pay click\n{{link}}\n\n',
        reminder_count: {
          one: 'Reminder 1',
          other: 'Reminder {{count}}',
        },
        reminder_description:
          'A reminder will be sent to your customer on this day',
        reminder_unit: {
          days: 'DAY(S)',
          weeks: 'WEEK(S)',
          months: 'MONTH(S)',
        },
        reminder_when: {
          before: 'BEFORE',
          after: 'AFTER',
        },
        reminder_added: 'REMINDER ADDED',
        reminder_removed: 'REMINDER REMOVED',
        confirm_delete: 'Are you sure you want to remove the payment reminder?',
        confirm_exit:
          'Are you sure you want to exit the page without setting a reminder?',
        set_reminder: 'Set Reminder',
        collection_settings: 'Collection settings',
        set_collection_date: {
          title: 'Set Collection Date',
          description: 'Select the day for customer to pay back',
        },
        reminder_settings: 'Reminder settings',
        add_reminder: {
          title: 'Add Reminder',
          description:
            'Tap here to create a new reminder. You can create as many as you want.',
        },
        default_reminder: {
          title: 'Default Reminder',
          description:
            'An automatic reminder will be sent to your customer on the collection date',
        },
        on_the_day_of_collection: 'On the day of collection',
      },
      customer_statement: {
        title: 'Share Customer Statement',
        filename: '{{customer_name}} Ledger Statement',
        message: 'Find attached your ledger statement from {{business_name}}',
      },
      transaction: {
        set_collection_date: 'set collection date',
        on_$date: 'on {{date}}',
        no_reminder_set: 'No Reminder Set',
        send_reminder: 'Send reminder',
        balance_statement:
          '{{customer_name}} has a positive balance of {{balance}}',
        not_owing: '{{customer_name}} is not owing',
        generating_statement: 'Generating Statement',
        share_statement: 'Generating Statement',
        start_here: 'Start adding records by tapping here',
        add_first: 'Add first transaction for {{customer_name}}',
      },
      entry: {
        sale: 'Record Sale',
        collection: 'Record Collection',
      },
      other: 'other',
      clear: 'Clear',
      cancel: 'Cancel',
      save: 'Save',
      optional: 'Optional',
      warning: 'Warning',
      yes: 'Yes',
      yes_delete: 'Yes, Delete',
      yes_proceed: 'Yes, Proceed',
      no: 'No',
      no_result_found: 'No result found',
      filter: {one: 'Filter', other: 'Filters'},
      filter_options: {
        owing: 'Owing',
        not_owing: 'Not Owing',
        surplus: 'Surplus',
      },
      customers: {
        start_adding: 'Start adding customers by creating a record here',
        customer_count: {
          zero: 'You have no customers yet.',
          one: '1 Customer',
          other: '{{count}} Customers',
        },
        customer_edited: 'CUSTOMER EDITED',
        customer_deleted: 'CUSTOMER DELETED',
        confirm_delete:
          'Are you sure you want to delete {{customer_name}} as a customer?',
        delete_customer: 'Delete Customer',
        customer_profile: 'Customer Profile',
        fields: {
          phone: {
            label: 'Phone number',
            placeholder: 'Enter customer number',
          },
          notes: {
            label: 'Notes',
            placeholder: 'Additional information about the customer',
          },
        },
      },
      payment: {
        edit_payment_preview_label_modal: {
          title: 'Payment preview label',
          description:
            'The payment preview label will be. You can change it to a text that your customers will understand',
        },
        payment_container: {
          add_payment_info: 'add Payment info',
          edit_payment_info: 'edit Payment info',
          no_payment_option: {
            description:
              'Add your preferred methods of collecting payment so your customers can know how to pay you',
          },
          copy_payment_link: 'COPY LINK',
          preview_payment_page: 'Preview Payment Page',
        },
        payment_preview_item: {
          copied: 'copied',
          copy: 'copy',
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
