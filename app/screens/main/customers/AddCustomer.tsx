import {ICustomer} from '@/models';
import {RouteProp, useNavigation} from '@react-navigation/native';
import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  FormBuilder,
  FormFields,
  PhoneNumber,
  PhoneNumberFieldRef,
  required,
} from '../../../components';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {useAddCustomer} from '@/services/customer/hooks';
import {Contact} from 'react-native-select-contact';
import {getContactService} from '@/services';
import parsePhoneNumberFromString from 'libphonenumber-js';
import {RadioInputRef} from '@/components/RadioInput';
import {TextInputFieldRef} from '@/components/TextInput';
import {handleError} from '@/services/error-boundary';
import {CustomersStackParamList} from '@/screens/main/customers/index';
import {MainStackParamList} from '@/screens/main';

type AddCustomerProps = {
  onSubmit?: (customer: ICustomer) => void;
  route: RouteProp<CustomersStackParamList & MainStackParamList, 'AddCustomer'>;
};

export const AddCustomer = (props: AddCustomerProps) => {
  const {onSubmit, route} = props;
  const navigation = useNavigation();
  const addCustomer = useAddCustomer();
  const {title = 'Add Customer', customer} = route.params ?? {};
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

  const formFields: FormFields<FormFieldName> = useMemo(() => {
    let phoneNumber: PhoneNumber | undefined;
    let parsedphoneNumber;
    if (
      customer?.mobile &&
      (parsedphoneNumber = getContactService().parsePhoneNumber(
        customer.mobile,
      ))
    ) {
      phoneNumber = {
        callingCode: String(parsedphoneNumber.countryCallingCode),
        number: String(parsedphoneNumber.nationalNumber),
      };
    }

    return {
      name: {
        type: 'text',
        props: {
          label: 'Customer Name',
          innerRef: (nameField: TextInputFieldRef) => {
            nameFieldRef.current = nameField;
          },
          value: customer?.name,
        },
        validations: [required()],
      },
      mobile: {
        type: 'mobile',
        props: {
          label: 'Phone Number (Optional)',
          innerRef: (mobileField: PhoneNumberFieldRef) => {
            mobileFieldRef.current = mobileField;
          },
          value: phoneNumber,
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
          value: customer?.email,
        },
      },
      saveToPhonebook: {
        type: 'radio',
        props: {
          label: 'Save to Phonebook',
          value: !customer,
          disabled: !!customer,
          display: !customer,
          innerRef: (saveToPhonebookField: RadioInputRef) => {
            saveToPhonebookFieldRef.current = saveToPhonebookField;
          },
        },
      },
    };
  }, [customer]);

  const handleImport = useCallback(() => {
    getContactService()
      .selectContactPhone()
      .then((selection) => {
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
      })
      .catch(handleError);
  }, []);

  const options = useMemo(() => {
    const result = [];
    if (!customer) {
      result.push({icon: 'book', onPress: handleImport});
    }
    return result;
  }, [customer, handleImport]);

  return (
    <Page
      header={{
        title,
        iconLeft: {},
        headerRight: {options},
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
          await addCustomer({...values, _id: customer?._id});
          if (values.saveToPhonebook && phoneNumber.number) {
            await getContactService().addContact({
              givenName: values.name,
              phoneNumbers: [
                `+${phoneNumber.callingCode}${phoneNumber.number}`,
              ],
            });
          }
          onSubmit ? onSubmit(values) : navigation.goBack();
        }}
        submitBtn={{
          title: 'Save',
        }}
        onInputChange={(values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          const {current: mobileField} = mobileFieldRef;
          if (mobileField) {
            if (phoneNumber.number !== importSelection?.phoneNumber.number) {
              const {current: saveToPhonebookField} = saveToPhonebookFieldRef;
              if (saveToPhonebookField?.disabled) {
                setImportSelection(null);
                saveToPhonebookField?.setDisabled(!!customer);
              }
            }
          }
        }}
      />
    </Page>
  );
};
