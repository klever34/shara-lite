interface Translations {
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
    name: FormField;
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
    something_went_wrong: string;
    clear_app_data: string;
    ok: string;
    sync: Card;
  };
  shara_tagline: string;
  onboarding_copy_1: Card;
  onboarding_copy_2: Card;
  onboarding_copy_3: Card;
  activities: string;
  customer: PluralizedString;
  payment_reminder: {
    title: string;
    message: string;
    thank_you_for_doing_business: string;
    you_owe: string;
    due_on: string;
    pay_at: string;
    reminder_count: {
      one: string;
      other: string;
    };
    reminder_description: string;
    reminder_unit: {
      days: string;
      weeks: string;
      months: string;
    };
    reminder_when: {
      before: string;
      after: string;
    };
    reminder_added: string;
    reminder_removed: string;
    confirm_delete: string;
    confirm_exit: string;
    set_reminder: string;
    collection_settings: string;
    set_collection_date: Card;
    reminder_settings: string;
    add_reminder: Card;
    default_reminder: Card;
    on_the_day_of_collection: String;
  };
  customer_statement: {
    title: string;
    filename: string;
    message: string;
  };
  transaction: {
    set_collection_date: string;
    on_$date: string;
    no_reminder_set: string;
    send_reminder: string;
    balance_statement: string;
    not_owing: string;
    generating_statement: string;
    share_statement: string;
    start_here: string;
    add_first: string;
  };
  collection: {
    collection_recorded: string;
    header: {
      title: string;
      description: string;
    };
    fields: {
      amount: {
        label: string;
      };
      note: {
        label: string;
        placeholder: string;
      };
    };
  };
  sale: {
    sale_recorded: string;
    header: {
      title: string;
      description: string;
    };
    fields: {
      amount: {
        label: string;
      };
      credit: {
        label: string;
      };
      note: {
        label: string;
        placeholder: string;
      };
    };
  };
  filter: PluralizedString;
  filter_options: {
    owing: string;
    not_owing: string;
    surplus: string;
  };
  entry: {
    sale: string;
    collection: string;
  };
  other: string;
  clear: string;
  cancel: string;
  save: string;
  optional: string;
  no_result_found: string;
  yes_delete: string;
  warning: string;
  date: string;
  total: string;
  yes: string;
  yes_proceed: string;
  no: string;
  remove: string;
  tel: string;
  customers: {
    start_adding: string;
    customer_count: PluralizedString;
    customer_edited: string;
    customer_deleted: string;
    confirm_delete: string;
    delete_customer: string;
    customer_profile: string;
    fields: {
      phone: FormField;
      notes: FormField;
    };
  };
  payment: {
    edit_payment_preview_label_modal: {
      title: string;
      description: string;
      payment_label_updated: string;
      validation_message: string;
      you_can_pay_me_via: string;
    };
    payment_container: {
      payment_added: string;
      warning_message: string;
      payment_edited: string;
      add_payment_info: string;
      edit_payment_info: string;
      remove_message: string;
      payment_settings: string;
      no_payment_option: {
        description: string;
      };
      copy_payment_link: string;
      preview_payment_page: string;
      add_new_payment: string;
    };
    payment_form: {
      label: string;
    };
    copied: string;
    copy: string;
    payment_preview_modal: {
      heading: string;
      footer: {
        title: string;
        website_url: string;
      };
    };
  };
}

interface PluralizedString {
  zero?: string;
  one: string;
  other: string;
}

interface Card {
  title: string;
  description: string;
}

interface FormField {
  label: string;
  placeholder?: string;
}
