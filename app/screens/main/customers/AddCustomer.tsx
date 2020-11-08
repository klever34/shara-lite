import {ICustomer} from '@/models';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  FormBuilder,
  FormFields,
  PhoneNumber,
  PhoneNumberFieldRef,
} from '../../../components';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {useAddCustomer} from '@/services/customer/hooks';
import {Contact, selectContactPhone} from 'react-native-select-contact';
import {getContactService} from '@/services';
import parsePhoneNumberFromString from 'libphonenumber-js';
import {RadioInputRef} from '@/components/RadioInput';
import {TextInputFieldRef} from '@/components/TextInput';

type AddCustomerProps = {
  onSubmit?: (customer: ICustomer) => void;
};

export const AddCustomer = (props: AddCustomerProps) => {
  const {onSubmit} = props;
  const navigation = useNavigation();
  const addCustomer = useAddCustomer();

  type FormFieldName = 'name' | 'mobile' | 'email' | 'saveToPhonebook';

  const [importSelection, setImportSelection] = useState<{
    contact: Contact;
    phoneNumber: PhoneNumber;
  } | null>(null);

  const nameFieldRef = useRef<TextInputFieldRef>();
  const emailFieldRef = useRef<TextInputFieldRef>();
  const mobileFieldRef = useRef<PhoneNumberFieldRef>();
  const saveToPhonebookFieldRef = useRef<RadioInputRef>();

  useEffect(() => {
    const {current: mobileField} = mobileFieldRef;
    const {current: nameField} = nameFieldRef;
    const {current: emailField} = emailFieldRef;
    if (mobileField && importSelection) {
      mobileField.setPhoneNumber(importSelection.phoneNumber);
      nameField?.onChangeText(importSelection.contact.name);
      nameField?.onChangeText(importSelection.contact.name);
      let emailEntry;
      if ((emailEntry = importSelection.contact.emails[0])) {
        emailField?.onChangeText(emailEntry.address);
      }
    }
  }, [importSelection]);

  useEffect(() => {
    const {current: saveToPhonebookField} = saveToPhonebookFieldRef;
    if (saveToPhonebookField && importSelection) {
      saveToPhonebookField.setValue(false);
      saveToPhonebookField.setDisabled(true);
    }
  }, [importSelection]);

  const formFields: FormFields<FormFieldName> = useMemo(
    () => ({
      name: {
        type: 'text',
        props: {
          label: 'Customer Name',
          innerRef: (nameField: TextInputFieldRef) => {
            nameFieldRef.current = nameField;
          },
        },
        required: true,
      },
      mobile: {
        type: 'mobile',
        props: {
          label: 'Phone Number (Optional)',
          innerRef: (mobileField: PhoneNumberFieldRef) => {
            mobileFieldRef.current = mobileField;
          },
        },
      },
      email: {
        type: 'text',
        props: {
          label: 'Email (Optional)',
          keyboardType: 'email-address',
          innerRef: (emailField: TextInputFieldRef) => {
            emailFieldRef.current = emailField;
          },
        },
      },
      saveToPhonebook: {
        type: 'radio',
        props: {
          label: 'Save to Phonebook',
          value: true,
          innerRef: (saveToPhonebookField: RadioInputRef) => {
            saveToPhonebookFieldRef.current = saveToPhonebookField;
          },
        },
      },
    }),
    [],
  );

  const handleImport = useCallback(() => {
    selectContactPhone().then((selection) => {
      if (!selection) {
        return;
      }
      let {selectedPhone, contact} = selection;
      const number = getContactService().formatPhoneNumber(
        selectedPhone?.number,
      );
      const phoneNumber = parsePhoneNumberFromString(number);
      if (phoneNumber) {
        setImportSelection({
          contact,
          phoneNumber: {
            callingCode: String(phoneNumber.countryCallingCode),
            number: String(phoneNumber.nationalNumber),
          },
        });
      }
    });
  }, []);

  return (
    <Page
      header={{
        title: 'Add Customer',
        iconLeft: {},
        iconRight: {iconName: 'book', onPress: handleImport},
      }}
      style={applyStyles('bg-white')}>
      <FormBuilder
        fields={formFields}
        onSubmit={async (values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          values = {
            ...values,
            mobile: phoneNumber.number
              ? `+${phoneNumber.callingCode}${phoneNumber.number}`
              : undefined,
          };
          await addCustomer(values);
          onSubmit ? onSubmit(values) : navigation.goBack();
        }}
        submitBtn={{
          title: 'Add',
        }}
        onInputChange={(values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          const {current: mobileField} = mobileFieldRef;
          if (mobileField) {
            if (phoneNumber.number !== importSelection?.phoneNumber.number) {
              const {current: saveToPhonebookField} = saveToPhonebookFieldRef;
              if (saveToPhonebookField?.disabled) {
                setImportSelection(null);
                saveToPhonebookField?.setDisabled(false);
              }
            }
          }
        }}
      />
    </Page>
  );
};
