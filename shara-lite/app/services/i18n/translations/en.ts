import {Strings} from 'types/i18n';

const en: Strings = {
  update_shara: {
    title: 'Update Shara',
    description:
      'A new version of the app is now available. Update now see what’s new',
    submit_button: 'Update Now',
  },
  next: 'Next',
  send: 'Send',
  skip: 'Skip',
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
    subheading:
      'We’ve sent a one-time password to mobile number **{{mobile}}**, check your SMS or Whatsapp and enter it below.',
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
    feedback_validation: 'Minimum of 25 charaters allowed',
    feedback_is_empty: 'Message cannot be empty',
    clear_app_data: 'Try clearing app data from application settings',
    ok: 'OK',
    sync: {
      title: 'Sync in progress',
      description:
        'We are syncing your data across the Shara app. This might take a few seconds.',
    },
    api: {
      fallbackError: 'Oops! Something unexpected happened.',
      auth: {
        otp: {
          welcomeBack:
            "Welcome back to Shara. We've sent an OTP to your mobile number",
          welcome: "Welcome to Shara. We've sent an OTP to your mobile number",
          selectCountry: 'Please select a country',
          fallbackError: 'Oops! An error occurred while signing up user',
        },
        login: {
          otpExpired: 'OTP has expired',
          success: 'Login Successful',
          fallbackError: 'Invalid mobile or OTP',
        },
      },
      business: {
        notFound: 'Business not found',
        create: {
          success: 'Business created successfully',
        },
        details: {
          success: 'Business found successfully',
        },
        customerDetails: {
          notFound: 'Customer not found',
          success: 'Customer found successfully',
        },
        update: {
          uniqueSlug: 'This slug has been taken already',
          success: 'Business updated successfully',
        },
      },
      fcm: {
        addToken: {
          missingFields: 'FCM token and platform are required',
          success: 'Token updated successfully',
        },
      },
      passwordReset: {
        notFound: 'Account not found',
        create: {
          success: 'Please use the OTP sent to your mobile number',
        },
        reset: {
          invalid: 'OTP has expired or is invalid',
          success: 'Password reset successful',
        },
        update: {
          uniqueSlug: 'This slug has been taken already',
          success: 'Business updated successfully',
        },
      },
      paymentProvider: {
        list: {
          success: 'Payment providers retrieved successfully',
        },
      },
      user: {
        update: {
          success: 'User updated successfully',
        },
      },
      mPesa: {
        initiateSTKPush: {
          business: {
            notFound: 'Business not found',
          },
          customer: {
            notFound: 'Business not found',
          },
          kenyaOnly: 'Business not found',
          success:
            'We were unable to send an STK push to your mobile number please try again or contact us through the Shara mobile application',
        },
        processValidationEvent: {
          success: 'Error Validating Payment',
        },
        processConfirmationEvent: {
          success: 'Error Confirming Payment',
        },
      },
      disbursement: {
        create: {
          notFound: 'Your selected withdrawal method is not available',
          success: 'Your withdrawal has been processed successfully',
          insufficientBalance: 'You cannot withdraw more than {{maxAmount}}',
          error:
            'We were unable to process your withdrawal, please try again or contact us through the Shara mobile application',
        },
      },
      drawdown: {
        create: {
          notFound: 'No drawdown has been approved for you',
          invalidAmount:
            'Amount specified is more than the amount available for drawdown',
          inactive: 'Drawdown is not currently active',
          error:
            'We were unable to process your drawdown, please try again or contact us through the Shara mobile application',
          success: 'Drawdown taken successfully',
        },
      },
      drawdownRepayment: {
        create: {
          notFound: 'No drawdown has been approved for you',
          complete: "You've already finished repaying your loans",
          error:
            'We were unable to process your drawdown, please try again or contact us through the Shara mobile application',
          insufficientBalance: 'Your wallet balance is not sufficient',
          success: 'Repayment successful',
        },
      },
      identity: {
        verify: {
          error:
            'We were unable to verify your identity, please try again or contact us through the Shara mobile application',
          invalid: 'Your ID is invalid',
          success: 'Verification successful',
        },
        validate: {
          error: 'OTP Validation Failed',
          invalid: 'Your OTP is invalid',
          success: 'OTP Validation successful',
        },
      },
      bnplApproval: {
        create: {
          success: 'BNPL approved successfully',
          error: 'Unable to approve BNPL for user',
          exists: 'An active BNPL exists for this user',
          userNotFound: 'User not found',
        },
      },
      bnplDrawdown: {
        create: {
          notFound: 'No BNPL has been approved for you',
          invalidAmount:
            'Amount specified is more than the amount available for drawdown',
          inactive: 'Drawdown is not currently active',
          error:
            'We were unable to process your drawdown, please try again or contact us through the Shara mobile application',
          success: 'Drawdown taken successfully',
          duplicate:
            'This looks like a duplicate transaction. Please wait 2 minutes to retry, if this is not an error.',
        },
      },
      bnplRepayment: {
        create: {
          notFound: 'No BNPL has been approved for you',
          complete: "You've already finished repaying your loans",
          error:
            'We were unable to process your repayment, please try again or contact us through the Shara mobile application',
          insufficientBalance: 'Your wallet balance is not sufficient',
          success: 'Repayment successful',
        },
      },
    },
  },
  shara_tagline: 'Built To Get You Paid Faster',
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
      "Securely record your business data. It's private, secure and backed up in case you lose your device",
  },
  activities: 'Activities',
  home: 'Home',
  payments: 'Payments',
  more_text: 'More',
  home_screen_setup_business_text: 'Setup your business',
  reminder_text: {
    one: 'Reminder',
    other: 'Reminders',
    zero: 'Set Reminders',
  },
  payment_reminder: {
    title: 'Settings',
    thank_you_for_doing_business:
      'Thank you for doing business with {{business_name}}.',
    reminder_count: {
      one: 'A reminder will be sent a day before collection date',
      other: 'A reminder will be sent {{count}} day before collection date',
    },
    no_reminder_set_text:
      'A reminder will be sent to the customer on the collection date. Tap to create a reminder',
    coming_soon_recurring_reminders: 'Coming Soon: Recurring reminders',
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
      description: 'When is the client going to pay?',
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
    no_reminder: {
      added: 'No reminder will be sent',
      removed: 'Reminders will be sent',
    },
  },
  recurrence_title: 'Recurrence',
  recurrence_description: 'Does this payment repeat?',
  reminder_message_title: 'Reminder Message',
  customer_statement: {
    title: 'Share Customer Statement',
    filename: '{{customer_name}} Ledger Statement',
    message: 'Find attached your ledger statement from {{business_name}}',
  },
  transaction: {
    set_collection_date: 'set collection date',
    collection_date: 'Collection Date',
    change_collection_date: 'Change Collection Date',
    collect_on_date: 'Collect on **{{date}}**',
    on_$date: 'on {{date}}',
    no_reminder_set: 'No Reminder Set',
    send_reminder: 'Share',
    balance_statement:
      '{{customer_name}} has a positive balance of {{balance}}',
    not_owing: '{{customer_name}} is not owing',
    generating_statement: 'Generating Statement',
    share_statement: 'Generate Statement',
    start_here: 'Start adding records by tapping here',
    add_first: 'Add first transaction for {{customer_name}}',
    no_credit_or_amount_warning:
      'Please enter collected amount or outstanding amount',
    edit_transaction: 'Edit Transaction',
    transaction_deleted: 'TRANSACTION DELETED',
    confirm_delete: 'Are you sure you want to delete this transaction?',
    is_collection_message: 'You Collected **{{total_amount}}**.',
    is_collection_with_customer_message:
      'You Collected **{{total_amount}}** *from {{customer_name}}*.',
    customer_owes_statement: '*{{customer_name}}* owes **{{credit_amount}}**',
    customer_has_advance_statement:
      '*{{customer_name}}* has an advance of **{{balance}}**',
    you_were_paid_statement:
      'You were paid **{{amount_paid}}** (No customer selected)',
    customer_paid_statement: '*{{customer_name}}* paid you **{{amount_paid}}**',
    customer_paid_with_outstanding_statement:
      '*{{customer_name}}* paid you **{{amount_paid}}** and **{{credit_amount}}** is outstanding',
    amount_collected: 'amount collected',
    amount_outstanding: 'amount outstanding',
    total_amount: 'Total amount',
    view_report: 'View report',
    no_activities_recorded_for_duration:
      'No activities were recorded for the chosen duration',
    start_adding_records:
      "Start adding records by tapping the '+' button below",
    transaction_success: '{{transaction_type}} has been recorded Successfully',
    share_customer_ledger_text: 'Share customer ledger',
    view_customer_ledger_text: 'View customer ledger',
    share_customer_ledger_whatsapp_text: 'Share ledger via whatsapp',
    search_input_placeholder: 'Search activities by client',
    collection_overdue: 'Collection overdue',
    next_reminder: 'Next Reminder',
  },
  receipts: {
    filter_options: {
      single_day: 'Single Day',
      '1_week': 'Last 7 Days',
      '1_month': 'Last 30 Days',
      date_range: 'Date Range',
    },
    receipt_share_title: 'Share Receipt',
    recent_purchase_message:
      'Hi {{customer_name}}, thank you for your recent purchase.',
    recent_purchase_message_from_business:
      'Hi {{customer_name}}, thank you for your recent purchase from {{business_name}}.',
    receipt_for: 'Receipt for',
    receipt_no: 'Receipt No',
  },
  salutation: 'Hello {{name}}!',
  you_paid_message: 'You paid {{amount}}.',
  you_owe_message: 'You owe {{credit_amount}}.',
  you_owe_message_with_due_date:
    'You owe {{credit_amount}} which is due on {{due_date}}.',
  payment_link_message: 'To pay click\\n{{payment_link}}.',
  powered_by_shara: 'Powered by Shara for free.\\nwww.shara.co',
  collection: {
    collection_recorded: 'COLLECTION RECORDED',
    button: {
      title: 'Record Collection',
      description: 'Record a payment received towards a debt or an advance',
    },
    header: {
      title: 'Record Collection',
      description: 'Quickly record a transaction or obligation',
    },
    fields: {
      amount: {
        label: 'Enter Amount',
      },
      note: {
        label: 'Note',
        placeholder: 'Write a note',
      },
    },
    today_text: 'Today',
    write_a_note_text: 'Write a note',
    select_a_photo_text: 'Select a photo',
    transaction_date_text: 'What date did this happen?',
    coming_soon_select_a_photo: 'Coming Soon: Select a Photo',
  },
  sale: {
    sale_recorded: 'SALE RECORDED',
    button: {
      title: 'Record Sale',
      description:
        'Create a sale record - what you were paid and what will be paid later',
    },
    header: {
      title: 'Record Sale',
      description: 'Quickly record a collection or outstanding',
    },
    fields: {
      amount: {
        label: 'Collected',
      },
      credit: {
        label: 'Outstanding',
      },
      note: {
        label: 'Note',
        placeholder: 'Write a note',
      },
    },
    select_customer: {
      title: 'Select Customer',
      description: 'Which customer is this transaction for?',
    },
    no_customer_text: 'Select a customer to complete this transaction',
    due_date_is_past: 'Select a new collection date for {{customer}}.',
  },
  entry: {
    sale: 'Record Sale',
    collection: 'Record Collection',
  },
  other: 'Other',
  collected: 'Collected',
  collection_due_today: 'Collection due today',
  outstanding: 'Outstanding',
  clear: 'Clear',
  cancel: 'Cancel',
  scan: 'Scan',
  scanning: 'Scanning',
  done: 'Done',
  dismiss: 'Dismiss',
  owe: {
    one: 'owe',
    other: 'owes',
  },
  result: {
    zero: 'No results found',
    one: '1 Result',
    other: '{{count}} Results',
  },
  clear_filter: 'Clear filter',
  note: {
    one: 'Note',
    other: 'Notes',
  },
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  close: 'Close',
  enable: 'Enable',
  unknown: 'UNKNOWN',
  share: 'Share',
  balance: 'Balance',
  paid: 'Paid',
  save: 'Save',
  from: 'From',
  to: 'To',
  success: 'Success',
  start_date: 'Start Date',
  end_date: 'End Date',
  and: 'and',
  optional: 'Optional',
  warning: 'Warning',
  date: 'Date',
  yes: 'Yes',
  total: 'Total',
  yes_delete: 'Yes, Delete',
  yes_proceed: 'Yes, Proceed',
  no: 'No',
  all: 'All',
  no_result_found: 'No result found',
  remove: 'Remove',
  tel: 'Tel',
  select_from_phonebook: 'Select from Phonebook',
  whatsapp: 'whatsapp',
  sms: 'sms',
  confirm: 'Confirm',
  address: 'Address',
  price: 'Price',
  filter: {
    one: 'Filter',
    other: 'Filters',
  },
  filter_options: {
    owing: 'You owe',
    not_owing: 'Owes you',
    surplus: 'Paid in full',
  },
  customer: {
    one: 'Customer',
    other: 'Customers',
  },
  client: {
    one: 'Client',
    other: 'Clients',
  },
  customers: {
    start_adding:
      "Start adding clients by creating a record with the '+' button below",
    customer_count: {
      zero: 'You have no clients yet.',
      one: '1 Client',
      other: '{{count}} Clients',
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
    select_customer: {
      title: 'Select Customer',
      description: 'Which customer is this transaction for?',
    },
    add_as_new_customer: 'Add {{customer_name}} as new customer',
    add_customer: 'Add Customer',
    add_customer_details: 'Add Customer details',
    add_new_customer_text: 'Add New Customer',
    search_input_placeholder: 'Type customer name',
    manual_customer_modal: {
      fields: {
        name: {
          label: 'Customer name',
        },
        email: {
          label: 'Customer email (Optional)',
        },
        phone: {
          label: 'Customer phone number (Optional)',
          placeholder: 'Enter customer number',
        },
      },
    },
  },
  payment: {
    edit_payment_preview_label_modal: {
      title: 'Payment preview label',
      description:
        'The payment preview label will be. You can change it to a text that your customers will understand',
      payment_label_updated: 'Payment Label updated',
      validation_message:
        'Payment label cannot be more than 150 characters long',
      you_can_pay_me_via: 'You can pay me via',
    },
    payment_container: {
      payment_added: 'PAYMENT OPTION ADDED',
      warning_message: 'Please fill all the fields in the form',
      payment_edited: 'PAYMENT OPTION EDITED',
      add_payment_info: 'add Payment info',
      edit_payment_info: 'edit Payment info',
      remove_message: 'Are you sure you want to remove the payment option?',
      payment_settings: 'Payment Settings',
      no_payment_option: {
        description:
          'Add your preferred methods of collecting payment so your customers can know how to pay you',
      },
      copy_payment_link: 'COPY LINK',
      preview_payment_page: 'Preview Payment Page',
      add_new_payment: 'Add New Payment',
      add_new_payment_method: 'Add New Payment',
      others_placeholder_text:
        'Enter the full information on how you want to get paid. It can contain, account number, name of bank, mobile money information, etc.',
    },
    payment_form: {
      label: 'Select a payment method',
    },
    copied: 'copied',
    copy: 'copy',
    payment_preview_modal: {
      heading: 'Your Payment Page Preview',
      footer: {
        title: 'Powered by Shara Inc © 2021',
        website_url: 'www.shara.co',
      },
    },
    bvn_input_field_placeholder: 'Enter your BVN',
    withdrawal_method: {
      bvn_description:
        'Please enter your National ID/BVN number. Your ID should match the names and the payment method in your Settings',
      bvn_input_field_placeholder: 'Enter your BVN',
      otp_description: 'An OTP has been sent to your BVN number *******4343',
      id_description:
        'Please enter your {{idType}}. Your ID should match the names and the payment method in your Settings',
      id_input_field_placeholder: 'Enter your {{idType}}',
      id_otp_description:
        'An OTP has been sent to your {{idType}} number {{mobile}}',
      add_withdrawal_method: 'Add Withdrawal Method',
      withdrawal_method_list:
        'These are your preferred methods of collecting payment so your customers can know how to pay you. See your link below:',
      edit_withdrawal_method: 'Edit Withdrawal Method',
      withdrawal_method_description:
        'Add your preferred methods of withdrawing funds from Shara.',
      make_default_withdrawal: 'Make default withdrawal account',
      withdrawal_picker_placeholder: 'Select a withdrawal method',
      select_an_option: 'Select an option',
    },
  },
  more: {
    header: {
      title: 'My Account',
      description: 'You account information at a glance',
    },
    list: {
      profile_settings: {
        title: 'My Profile',
        description: 'View and edit your personal information',
      },
      business_settings: {
        title: 'Business Settings',
        description: 'View and edit your business information',
      },
      payment_settings: {
        title: 'Payment Settings',
        description: 'View and edit your payment information',
      },
      referral: {
        title: 'Referral',
        description: 'Enter referral code',
      },
      feedback: {
        title: 'Give Feedback',
        description: 'Provide any feedback here?',
      },
      language: {
        title: 'Language',
        description: 'Select your language',
      },
      support: {
        title: 'Contact Support',
        description: 'Ask a question or leave a message',
      },
    },
    logout: {
      logout_data_verification_text: 'Verifying your saved data...',
      logout_confirmation_text: 'Are you sure you want to logout?',
      logout_unsaved_data_text:
        'You still have some unsaved data. Are you sure you want to logout?',
    },
    business_settings_edit_button:
      'Tap here to complete your Business Settings',
    logout_button: 'Logout',
    yes: 'Yes',
    no: 'No',
  },
  profile_settings: {
    title: 'Profile Settings',
    toast_text: 'User profile updated successfully',
    fields: {
      firstName: {
        label: 'First Name',
      },
      lastName: {
        label: 'Last Name',
      },
      mobile: {
        label: 'What’s your phone number?',
      },
      email: {
        label: "What's your email? (Optional)",
      },
    },
    save_button: 'Save',
  },
  business_settings: {
    title: 'Business Settings',
    toast_text: 'User profile updated successfully',
    fields: {
      name: {
        label: 'What’s the name of your business?',
      },
      address: {
        label: 'Where is your business located?',
      },
      mobile: {
        label: 'What’s your business phone number?',
      },
      image: {
        label: 'Do you have a logo?',
        placeholder: 'Upload logo',
      },
    },
    action_buttons: {
      preview_receipt_button: 'Preview Receipt',
      save_button: 'Save',
    },
    receipt_preview: {
      title: 'Receipt',
      saved: 'Saved',
      description: 'Here’s what your receipt looks like',
    },
  },
  referral: {
    title: 'Referral',
    toast_text: 'Referral code submitted',
    fields: {
      code: {
        label: 'Referral Code',
        placeholder: 'Enter referral code here',
      },
    },
    submit_button: 'Submit',
  },
  feedback: {
    title: 'Feedback',
    toast_text: 'Thank you for your Feedback',
    fields: {
      code: {
        label: 'Feedback',
        placeholder: 'Enter feedback here',
      },
    },
    submit_button: 'Submit',
  },
  create_receipts_with_shara: 'CREATE RECEIPTS FOR FREE WITH SHARA',
  report: {
    title: 'View Report',
    filter_button_text: 'Filters',
    search_input_placeholder: 'Search customers here',
    active_filter_label_text: 'Filter',
    clear_filter_button_text: 'Clear',
    net_balance_text: 'Net Balance',
    download_report_toast_text: 'Download Report',
    results: {
      one: 'Result',
      other: 'Results',
    },
    download_report_button_text: 'Download Report',
    empty_state_text: {
      no_results_found: 'No results found',
      no_records_yet: 'You have no records yet',
    },
    report_list_header: {
      transactions_text: 'Transactions',
      total_entries_text: 'Entries',
      total_cost_text: 'Total Cost',
      amount_paid_text: 'Amount Paid',
    },
    excel_report_headings: {
      date: 'Date',
      name: 'Name',
      note: 'Note',
      total_amount: 'Total Amount',
      amount_paid: 'Amount Paid',
      balance: 'Balance',
    },
    downloaded_report_notification_title: 'Report exported successfully',
  },
  bluetooth_printer: {
    setup: {
      title: 'bluetooth settings',
      description: 'Enable the bluetooth on you device to start printing.',
    },
    select_printer: 'Select printer',
    no_nearby_bluetooth: 'No nearby Bluetooth devices were found',
    device_not_supported: 'Device does not support bluetooth!',
    search_for_devices: 'Search for devices',
  },
  reminder_popup: {
    title: 'Which days do you want your reminders to be sent',
    collection_day: {
      one: '1 day before',
      other: '{{count}} days before',
    },
    collect_on_text: 'Collect on {{due_date}}',
    no_collection_date_text:
      'You need to set a collection date before you set reminders',
    set_collection_date_button_text: 'Set Collection Date',
    default_collection_day: 'Collection Day (Default)',
    no_collection_day: 'None (No reminder will be sent)',
  },
  default_text: 'Default',
  payment_method: 'Payment method',
  save_to_phonebook: 'Save to Phonebook',
  user_profile: 'User Profile',
  my_customers: 'My Customers',
  reports: 'Reports',
  menu: 'Menu',
  user_id: 'User ID',
  payment_reminder_for: 'Payment reminder for',
  payment_due: 'Payment Due',
  payment_due_text: 'This payment is due on',
  outstanding_text: 'has an outstanding of',
  record: 'Record',
  cancel_confirmation_text: 'Confirm cancellation',
  cancellation_text: 'Why are you cancelling?',
  cancellation_placeholder: 'Enter cancellation reason here',
  upload_business_logo: 'Upload Business logo',
  business_name: 'Business Name',
  skip_setup: 'Skip setup',
  product_details: 'Product Details',
  search_input_placeholder: 'Search clients here',
  country: 'Country',
  in: 'in',
  money: 'Money',
  payment_activities: {
    empty_state: {
      description:
        'Receive and withdraw money using your Shara wallet. Click the button below to get started.',
      tag: 'Go to Money Settings',
    },
    bnpl_text: 'BNPL',
    search_placeholder: 'Search payments here...',
    received: 'Received',
    withdrawn: 'Withdrawn',
    wallet_balance: 'Your wallet balance',
    merchant_id: '{{merchant_id}} - merchant Id',
    tap_to_copy: 'Tap to copy',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    drawdown: 'Drawdown',
    payment_activities: 'Payment Activities',
    no_money_activities: 'You have no Money activities yet',
    your_wallet_balance: 'Your wallet balance',
    your_merchant_id_is: 'Your Merchant ID is',
    your_wallet_account_no_is: {
      one: 'Your wallet account number is',
      other: 'Your wallet account numbers are',
    },
    tap_to_copy_merchant_id: 'Tap to copy Merchant ID',
    tap_to_copy_wallet_account_no: 'Tap to copy wallet account number',
    withdraw_fields: {
      amount: {
        label: 'Enter Amount',
      },
      note: {
        label: 'Write a note',
      },
    },
    deposit_help_text:
      'See below the various ways to deposit funds into your wallet',
    select_withdrawal_account: 'Select withdrawal account',
    confirm_withdrawal: 'Confirm withdrawal',
    about_to_withdraw:
      'You are about to withdraw **{{amount}}** to\\n**{{bank_details}}**',
    withdraw_success:
      'Your transaction is being processed. It may take up to a few minutes to reflect in your Shara wallet',
    payment_activity: {
      received_payment:
        'Received payment of **{{amount}}** via **{{provider}}**',
      withdrawal: 'Withdrawal of **{{amount}}** to your **{{provider}}**',
      select_customer: 'Select Customer',
    },
    withdraw_excess_error:
      'Withdrawal amount is greater than your wallet balance',
    withdraw_amount_required_error: 'Amount is required',
    withdraw_minimum_error: 'Withdrawal amount must be greater than {{amount}}',
    withdraw_maximum_error: 'Maximum amount per withdrawal is {{amount}}',
    not_available: {
      title: 'Not available in your country',
      description:
        "Hey there, payment is currently unavailable in your country. We're working hard to bring it to you soon",
      fields: {
        method_of_disbursement: {
          label: 'How do you receive payment in your country?',
        },
      },
    },
    not_withdrawal_acct: {
      title: 'No Withdrawal Account',
      description:
        'Please we need to know where to send your money to. Please go and set this up',
      tag: 'Go to payment settings',
    },
    feedback_submitted: 'Feedback Submitted',
    stk_push: {
      notification_sent: 'Notification sent',
      amount_minimum_error: 'Amount must be greater than {{amount}}',
      confirmation_text:
        'A notification has been sent to your MPESA number **{{mobile}}**. Please check your phone to confirm.',
      fields: {
        amount: {
          label: 'Amount',
          placeholder: 'Enter amount',
          errorMessage: 'Amount is required',
        },
        mobile: {
          label: 'Phone Number',
          placeholder: 'Enter your phone number',
          errorMessage: 'Phone Number is required',
        },
      },
    },
    bnpl_drawdown_item:
      'Buy now pay later drawdown of **{{amount}}** to **{{customer}}**',
    bnpl_repayment_item:
      'Buy now pay later repayment of **{{amount}}** from **{{customer}}**',
    no_decimals: "MPESA doesn't allow for decimal payments",
  },
  drawdown: {
    title: 'Drawdown',
    amount_available: 'Amount available for drawdown',
    amount_owed: 'Total Owed - {{total_owed}}',
    take_drawdown: 'Take Drawdown',
    make_repayment: 'Make Repayment',
    nothing_here: 'Nothing to show here',
    drawdown_history: 'Drawdown History',
    active_drawdowns: 'Active Drawdowns',
    take_drawdown_lead_text:
      'Note: All funds will be added to your wallet balance',
    repayment: 'Repayment',
    make_payment: 'Make Payment',
    repayment_date: {
      without_date: 'Repayment Date',
      with_date: 'Repayment Date **{{date}}**',
    },
    repayment_amount: 'Repayment amount (includes {{amount}} transaction fee)',
    request: 'Request',
    what_is_drawdown: 'What is drawdown',
    drawdown_item_text:
      'Drawdown of **{{amount}}** to your wallet on **{{date}}**',
    transaction_fee: 'Transaction Fee',
    withdraw_success:
      'Your withdrawal of **{{amount}}** was successful. Funds have been added to your wallet balance.',
    withdraw_excess_error: 'Withdrawal amount is more than your drawdown limit',
    repayment_excess_error:
      'The amount you want to pay is more than your wallet balance',
    amount_required_error: 'Amount is required',
    not_qualified: 'You do not qualify for drawdowns at the moment.',
    repayment_success:
      'Your drawdown repayment of **{{amount}}** was successful. Funds have been deducted from your wallet balance.',
    repayment_item_text:
      'Drawdown repayment of **{{amount}}** from your wallet on **{{date}}**',
  },
  bnpl: {
    not_available: {
      button_text: 'Go to money settings',
      instruction:
        'Receive and withdraw money using your Shara wallet. Click the button below to get started.',
    },
    buy_now_pay_later: 'Buy Now Pay Later',
    transaction_details: 'Transaction Details',
    day_text: {
      one: '{{amount}} day',
      other: '{{amount}} days',
    },
    active_text: 'Active',
    complete_text: 'Complete',
    clients_text: 'Clients',
    active_empty_state:
      'You have no active BNPL transactions yet. Click the button below to get started.',
    complete_empty_state:
      'You have no fully completed BNPL transactions yet. Click the button below to get started.',
    new_transaction_text: 'New transaction',
    total_completed_text: 'Total completed',
    amount_used_text: 'Amount drawn',
    amount_available_text: 'Amount available',
    completed_text: 'Completed',
    payment_left_text: {
      one: '{{amount}} payment left',
      other: '{{amount}} payments left',
    },
    payment_made_text: {
      one: '{{amount}} payment made',
      other: '{{amount}} payments made',
    },
    share_receipt: 'Share Receipt',
    repayment_per_week: '{{amount}}/week',
    record_transaction: {
      title: 'Enter transaction',
      fields: {
        note: {
          label: 'Note',
          placeholder: 'E.g what was sold or any other information',
        },
        total_amount: {
          label: 'Total Amount',
          errorMessage: 'Total amount is required',
        },
        amount_paid: {
          label: 'Amount Paid',
        },
        customer: {
          label: 'Customer',
          placeholder: 'Select a customer',
          errorMessage: 'Customer is required',
        },
      },
      balance: 'Balance',
      bnpl_terms_text: 'Buy now pay later terms',
      repayment_date: 'to be paid in full by {{date}}',
      excess_amount_error: 'Amount is more than amount available for drawdown',
    },
    confirmation: {
      instruction:
        '1. Accept the terms of the BNPL offered by Shara to you 2. Confirm that your client has accepted the terms of the BNPL you are offering them powered by Shara.',
      title: 'Confirm Buy Now Pay Later',
      client_terms:
        'I confirm that my Client has accepted the terms of the Buy Now Pay Later product I am offering him or her.',
      merchant_terms:
        'I have accepted the [Terms and Conditions](https://docs.google.com/document/d/e/2PACX-1vR-gp6aV3UKaVUo8KVqpNMpITxqZG6AgC1M4_ZPH9DQj4ApsHceJcrrl93KemalVg/pub) for Shara Buy Now Pay Later',
      terms: '**Terms**',
    },
    success: {
      heading: 'Buy Now Pay Later Successful',
      outstanding:
        'The outstanding amount of {{amount}} has been added to your wallet.',
      payment: 'Client pays {{amount}} over {{days}} days',
    },
    receipt: {
      bnpl_text: 'Buy Now Pay Later (8 weeks)',
    },
    add_repayment: 'Add Repayment',
    client: {
      upcoming_text: 'Upcoming',
      paid_text: 'Paid',
      wallet_balance: 'Wallet balance {{amount}}',
      add_repayment_note:
        'Note that this amount will be deducted from your wallet balance',
      repayment_to_shara: 'Repayment to Shara Inc.',
      repayment: {
        fields: {
          amount: {
            label: 'Amount',
            errorMessage: 'Amount is required',
          },
        },
        success: {
          heading: 'Buy Now Pay Later Payment Successful',
          payment:
            'Payment of {{amount}} confirmed and deducted from your wallet balance',
          outstanding: 'Outstanding: {{amount}} over {{days}} days',
          repayment_complete: 'BNPL Transaction Repayment Completed!',
        },
      },
      empty_state:
        '{{client}} has made no repayment yet. Click the button below to record a repayment.',
      paid: 'Paid',
      not_paid: 'Not paid',
      past_due: 'Past due',
    },
    transaction_info: {
      date: '{{date}}',
      total_amount_text: 'Total Amount',
      total_amount: '{{amount}}',
      paid_text: 'Paid',
      paid_amount: '{{amount}}',
      outstanding_text: 'Outstanding',
      outstanding_amount: '{{amount}}',
      notes: 'Notes',
      notes_text_content: '{{notes}}',
    },
    recent_purchase_message:
      'Hi {{customer_name}}, thank you for your recent purchase.',
    recent_purchase_message_from_business:
      'Hi {{customer_name}}, thank you for your recent purchase from {{business_name}}.',
    you_paid_message: 'You paid {{amount}}.',
    you_owe_message: 'You owe {{credit_amount}}.',
    next_repayment:
      'Your next repayment is {{amount}} and it is due on {{date}}.',
    first_repayment:
      'Your first repayment is {{amount}} and it is due on {{date}}.',
  },
  copied: 'Copied',
  submit: 'Submit',
};

export default en;
