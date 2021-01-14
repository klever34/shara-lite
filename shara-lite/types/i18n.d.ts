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
    no_credit_or_amount_warning: string;
    edit_transaction: string;
    transaction_deleted: string;
    confirm_delete: string;
  };
  receipts: {
    filter_options: {
      single_day: string;
      '1_week': string;
      '1_month': string;
      date_range: string;
    };
    receipt_share_title: string;
    receipt_share_message: string;
    receipt_share_from_who: string;
    receipt_share_credit_message: string;
    receipt_share_due_date_message: string;
    receipt_share_payment_link_message: string;
  };
  collection: {
    collection_recorded: string;
    header: Card;
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
    header: Card;
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
  all: string;
  collected: string;
  collection_due_today: string;
  outstanding: string;
  note: PluralizedString;
  delete: string;
  edit: string;
  share: string;
  yes: string;
  yes_proceed: string;
  no: string;
  select_from_phonebook: string;
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
    select_customer: Card;
    add_as_new_customer: string;
    add_customer: string;
  };
  payment: {
    edit_payment_preview_label_modal: Card;
    payment_container: {
      add_payment_info: string;
      edit_payment_info: string;
      no_payment_option: {
        description: string;
      };
      copy_payment_link: string;
      preview_payment_page: string;
    };
    payment_preview_item: {
      copied: string;
      copy: string;
    };
  };
  more: {
    header: Card;
    list: {
      profile_settings: Card;
      business_settings: Card;
      payment_settings: Card;
      referral: Card;
      feedback: Card;
    };
    logout_button: string;
    logout: {
      logout_data_verification_text: string;
      logout_confirmation_text: string;
      logout_unsaved_data_text: string;
    },
    business_settings_edit_button: string;
    yes: string;
    no: string;
  },
  profile_settings: {
    title: string;
    toast_text: string;
    fields: {
      firstName: FormField;
      lastName: FormField;
      mobile: FormField;
      email: FormField;
    },
    save_button: string;
  },
  business_settings: {
    title: string;
    toast_text: string;
    fields: {
      name: FormField;
      address: FormField;
      mobile: FormField;
      image: FormField;
    },
    action_buttons: {
      save_button: string;
      preview_receipt_button: string;
    },
    receipt_preview: {
      title: string;
      saved: string;
      description: string;
    }
  },
  referral: {
    title: string;
    toast_text: string;
    fields: {
      code: FormField;
    },
    submit_button: string;
  },
  feedback: {
    title: string;
    toast_text: string;
    fields: {
      code: FormField;
    },
    submit_button: string;
  }
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
