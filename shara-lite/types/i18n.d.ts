export interface Strings {
  update_shara: {
    title: string;
    description: string;
    submit_button: string;
  };
  next: string;
  skip: string;
  send: string;
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
    feedback_validation: string;
    feedback_is_empty: string;
    clear_app_data: string;
    ok: string;
    sync: Card;
    api: {
      fallbackError: string;
      auth: {
        otp: {
          welcomeBack: string;
          welcome: string;
          selectCountry: string;
          fallbackError: string;
        };
        login: {
          otpExpired: string;
          success: string;
          fallbackError: string;
        };
      };
      business: {
        notFound: string;
        create: {
          success: string;
        };
        details: {
          success: string;
        };
        customerDetails: {
          notFound: string;
          success: string;
        };
        update: {
          uniqueSlug: string;
          success: string;
        };
      };
      fcm: {
        addToken: {
          missingFields: string;
          success: string;
        };
      };
      passwordReset: {
        notFound: string;
        create: {
          success: string;
        };
        reset: {
          invalid: string;
          success: string;
        };
        update: {
          uniqueSlug: string;
          success: string;
        };
      };
      paymentProvider: {
        list: {
          success: string;
        };
      };
      user: {
        update: {
          success: string;
        };
      };
      mPesa: {
        initiateSTKPush: {
          business: {
            notFound: string;
          };
          customer: {
            notFound: string;
          };
          kenyaOnly: string;
          success: string;
        };
        processValidationEvent: {
          success: string;
        };
        processConfirmationEvent: {
          success: string;
        };
      };
      disbursement: {
        create: {
          notFound: string;
          success: string;
          insufficientBalance: string;
          error: string;
        };
      };
      drawdown: {
        create: {
          notFound: string;
          invalidAmount: string;
          inactive: string;
          error: string;
          success: string;
        };
      };
      drawdownRepayment: {
        create: {
          notFound: string;
          complete: string;
          error: string;
          insufficientBalance: string;
          success: string;
        };
      };
      identity: {
        verify: {
          error: string;
          invalid: string;
          success: string;
        };
        validate: {
          error: string;
          invalid: string;
          success: string;
        };
      };
      bnplApproval: {
        create: {
          success: string;
          error: string;
          exists: string;
          userNotFound: string;
        };
      };
      bnplDrawdown: {
        create: {
          notFound: string;
          invalidAmount: string;
          inactive: string;
          error: string;
          success: string;
          duplicate: string;
        };
      };
      bnplRepayment: {
        create: {
          notFound: string;
          complete: string;
          error: string;
          insufficientBalance: string;
          success: string;
        };
      };
    };
  };
  home_screen_setup_business_text: string;
  shara_tagline: string;
  onboarding_copy_1: Card;
  onboarding_copy_2: Card;
  onboarding_copy_3: Card;
  activities: string;
  home: string;
  payments: string;
  money: string;
  more_text: string;
  client: PluralizedString;
  customer: PluralizedString;
  done: string;
  dismiss: string;
  owe: PluralizedString;
  result: PluralizedString;
  clear_filter: string;
  from: string;
  to: string;
  success: string;
  start_date: string;
  end_date: string;
  and: string;
  default_text: string;
  payment_reminder: {
    title: string;
    thank_you_for_doing_business: string;
    no_reminder_set_text: string;
    reminder_count: PluralizedString;
    reminder_description: string;
    coming_soon_recurring_reminders: string;
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
    no_reminder: {added: string; removed: string};
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
  recurrence_title: string;
  recurrence_description: string;
  reminder_message_title: string;
  reminder_text: PluralizedString;
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
    search_input_placeholder: string;
    no_credit_or_amount_warning: string;
    edit_transaction: string;
    transaction_deleted: string;
    confirm_delete: string;
    collection_date: string;
    change_collection_date: string;
    collect_on_date: string;
    is_collection_message: string;
    is_collection_with_customer_message: string;
    customer_owes_statement: string;
    customer_has_advance_statement: string;
    you_were_paid_statement: string;
    customer_paid_statement: string;
    customer_paid_with_outstanding_statement: string;
    amount_collected: string;
    amount_outstanding: string;
    total_amount: string;
    view_report: string;
    no_activities_recorded_for_duration: string;
    start_adding_records: string;
    transaction_success: string;
    share_customer_ledger_text: string;
    view_customer_ledger_text: string;
    share_customer_ledger_whatsapp_text: string;
    collection_overdue: string;
    next_reminder: string;
  };
  receipts: {
    filter_options: {
      single_day: string;
      '1_week': string;
      '1_month': string;
      date_range: string;
    };
    receipt_share_title: string;
    recent_purchase_message: string;
    recent_purchase_message_from_business: string;
    receipt_for: string;
    receipt_no: string;
  };
  salutation: string;
  you_paid_message: string;
  you_owe_message: string;
  you_owe_message_with_due_date: string;
  payment_link_message: string;
  powered_by_shara: string;
  collection: {
    collection_recorded: string;
    button: Card;
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
    today_text: string;
    write_a_note_text: string;
    select_a_photo_text: string;
    transaction_date_text: string;
    coming_soon_select_a_photo: string;
  };
  sale: {
    sale_recorded: string;
    button: Card;
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
    select_customer: {
      title: string;
      description: string;
    };
    no_customer_text: string;
    due_date_is_past: string;
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
  sms: string;
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
  balance: string;
  paid: string;
  yes: string;
  yes_proceed: string;
  no: string;
  remove: string;
  tel: string;
  select_from_phonebook: string;
  scan: string;
  scanning: string;
  add: string;
  close: string;
  enable: string;
  unknown: string;
  whatsapp: string;
  confirm: string;
  address: string;
  price: string;
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
    add_customer_details: string;
    add_new_customer_text: string;
    search_input_placeholder: string;
    manual_customer_modal: {
      fields: {
        name: FormField;
        phone: FormField;
        email: FormField;
      };
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
      add_new_payment_method: string;
      others_placeholder_text: string;
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
    bvn_input_field_placeholder: string;
    withdrawal_method: {
      bvn_description: string;
      bvn_input_field_placeholder: string;
      otp_description: string;
      id_description: string;
      id_input_field_placeholder: string;
      id_otp_description: string;
      add_withdrawal_method: string;
      withdrawal_method_list: string;
      withdrawal_method_description: string;
      edit_withdrawal_method: string;
      make_default_withdrawal: string;
      withdrawal_picker_placeholder: string;
      select_an_option: string;
    };
  };
  more: {
    header: Card;
    list: {
      profile_settings: Card;
      business_settings: Card;
      payment_settings: Card;
      language: Card;
      support: Card;
      referral: Card;
      feedback: Card;
    };
    logout_button: string;
    logout: {
      logout_data_verification_text: string;
      logout_confirmation_text: string;
      logout_unsaved_data_text: string;
    };
    business_settings_edit_button: string;
    yes: string;
    no: string;
  };
  profile_settings: {
    title: string;
    toast_text: string;
    fields: {
      firstName: FormField;
      lastName: FormField;
      mobile: FormField;
      email: FormField;
    };
    save_button: string;
  };
  business_settings: {
    title: string;
    toast_text: string;
    fields: {
      name: FormField;
      address: FormField;
      mobile: FormField;
      image: FormField;
    };
    action_buttons: {
      save_button: string;
      preview_receipt_button: string;
    };
    receipt_preview: {
      title: string;
      saved: string;
      description: string;
    };
  };
  referral: {
    title: string;
    toast_text: string;
    fields: {
      code: FormField;
    };
    submit_button: string;
  };
  feedback: {
    title: string;
    toast_text: string;
    fields: {
      code: FormField;
    };
    submit_button: string;
  };
  create_receipts_with_shara: string;
  report: {
    title: string;
    filter_button_text: string;
    search_input_placeholder: string;
    active_filter_label_text: string;
    clear_filter_button_text: string;
    download_report_toast_text: string;
    net_balance_text: string;
    results: PluralizedString;
    download_report_button_text: string;
    empty_state_text: {
      no_results_found: string;
      no_records_yet: string;
    };
    report_list_header: {
      transactions_text: string;
      total_entries_text: string;
      total_cost_text: string;
      amount_paid_text: string;
    };
    excel_report_headings: {
      date: string;
      name: string;
      note: string;
      total_amount: string;
      amount_paid: string;
      balance: string;
    };
    downloaded_report_notification_title: string;
  };
  bluetooth_printer: {
    setup: {
      title: string;
      description: string;
    };
    select_printer: string;
    no_nearby_bluetooth: string;
    device_not_supported: string;
    search_for_devices: string;
  };
  reminder_popup: {
    title: string;
    collect_on_text: string;
    collection_day: PluralizedString;
    no_collection_date_text: string;
    default_collection_day: string;
    no_collection_day: string;
    set_collection_date_button_text: string;
  };
  payment_method: string;
  save_to_phonebook: string;
  user_profile: string;
  my_customers: string;
  reports: string;
  menu: string;
  user_id: string;
  payment_reminder_for: string;
  payment_due: string;
  payment_due_text: string;
  outstanding_text: string;
  record: string;
  cancel_confirmation_text: string;
  cancellation_text: string;
  cancellation_placeholder: string;
  upload_business_logo: string;
  business_name: string;
  skip_setup: string;
  product_details: string;
  search_input_placeholder: string;
  country: string;
  in: string;
  payment_activities: {
    empty_state: Card;
    search_placeholder: string;
    received: string;
    withdrawn: string;
    wallet_balance: string;
    merchant_id: string;
    tap_to_copy: string;
    withdraw: string;
    drawdown: string;
    bnpl_text: string;
    payment_activities: string;
    no_money_activities: string;
    your_wallet_balance: string;
    your_merchant_id_is: string;
    your_wallet_account_no_is: PluralizedString;
    tap_to_copy_merchant_id: string;
    tap_to_copy_wallet_account_no: string;
    deposit: string;
    withdraw_fields: {
      amount: FormField;
      note: FormField;
    };
    withdraw_excess_error: string;
    withdraw_minimum_error: string;
    withdraw_amount_required_error: string;
    deposit_help_text: string;
    select_withdrawal_account: string;
    confirm_withdrawal: string;
    about_to_withdraw: string;
    withdraw_success: string;
    payment_activity: {
      received_payment: string;
      withdrawal: string;
      select_customer: string;
    };
    not_available: {
      title: string;
      description: string;
      fields: {
        method_of_disbursement: {
          label: string;
        };
      };
    };
    not_withdrawal_acct: Card;
    feedback_submitted: string;
    stk_push: {
      confirmation_text: string;
      notification_sent: string;
      amount_minimum_error: string;
      fields: {amount: FormField; mobile: FormField};
    };
    bnpl_drawdown_item: string;
    bnpl_repayment_item: string;
    no_decimals: string;
  };
  drawdown: {
    title: string;
    amount_available: string;
    amount_owed: string;
    take_drawdown: string;
    make_repayment: string;
    nothing_here: string;
    drawdown_history: string;
    active_drawdowns: string;
    take_drawdown_lead_text: string;
    repayment: string;
    make_payment: string;
    repayment_date: {without_date: string; with_date: string};
    repayment_amount: string;
    request: string;
    what_is_drawdown: string;
    drawdown_item_text: string;
    transaction_fee: string;
    withdraw_success: string;
    withdraw_excess_error: string;
    repayment_excess_error: string;
    amount_required_error: string;
    not_qualified: string;
    repayment_success: string;
    repayment_item_text: string;
  };
  bnpl: {
    day_text: PluralizedString;
    not_available: {
      button_text: string;
      instruction: string;
    };
    active_empty_state: string;
    complete_empty_state: string;
    active_text: string;
    complete_text: string;
    clients_text: string;
    buy_now_pay_later: string;
    transaction_details: string;
    new_transaction_text: string;
    total_completed_text: string;
    amount_used_text: string;
    amount_available_text: string;
    completed_text: string;
    payment_left_text: PluralizedString;
    payment_made_text: PluralizedString;
    repayment_per_week: string;
    add_repayment: string;
    share_receipt: string;
    record_transaction: {
      title: string;
      fields: {
        note: FormField;
        total_amount: FormField;
        amount_paid: FormField;
        customer: FormField;
      };
      balance: string;
      bnpl_terms_text: string;
      repayment_date: string;
      excess_amount_error: string;
    };
    confirmation: {
      title: string;
      instruction: string;
      client_terms: string;
      merchant_terms: string;
      terms: string;
    };
    success: {
      heading: string;
      outstanding: string;
      payment: string;
    };
    receipt: {
      bnpl_text: string;
    };
    client: {
      upcoming_text: string;
      paid_text: string;
      wallet_balance: string;
      add_repayment_note: string;
      repayment_to_shara: string;
      repayment: {
        fields: {
          amount: FormField;
        };
        success: {
          heading: string;
          outstanding: string;
          payment: string;
          repayment_complete: string;
        };
      };
      empty_state: string;
      paid: string;
      not_paid: string;
      past_due: string;
    };
    transaction_info: {
      date: string;
      total_amount_text: string;
      total_amount: string;
      paid_text: string;
      paid_amount: string;
      outstanding_text: string;
      outstanding_amount: string;
      notes: string;
      notes_text_content: string;
    };
    recent_purchase_message: string;
    recent_purchase_message_from_business: string;
    you_paid_message: string;
    you_owe_message: string;
    next_repayment: string;
    first_repayment: string;
  };
  copied: string;
  submit: string;
}

interface PluralizedString {
  zero?: string;
  one: string;
  other: string;
}

interface Card {
  title?: string;
  description?: string;
  tag?: string;
}

interface FormField {
  label: string;
  placeholder?: string;
  errorMessage?: string;
}
