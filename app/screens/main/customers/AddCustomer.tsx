import {ICustomer} from '@/models';
import {useNavigation} from '@react-navigation/native';
import React, {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useRef,
  useEffect,
} from 'react';
import {Text} from 'react-native';
import {FormBuilder, FormFields, PhoneNumber} from '../../../components';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {useAddCustomer} from '@/services/customer/hooks';
import Touchable from '@/components/Touchable';
import {selectContactPhone} from 'react-native-select-contact';
import {getContactService} from '@/services';
import parsePhoneNumberFromString from 'libphonenumber-js';

type AddCustomerProps = {
  onSubmit?: (customer: ICustomer) => void;
};

export const AddCustomer = (props: AddCustomerProps) => {
  const {onSubmit} = props;
  const navigation = useNavigation();
  const addCustomer = useAddCustomer();

  type FormFieldName = 'name' | 'mobile' | 'email' | 'saveToPhonebook';

  const [selectedMobile, setSelectedMobile] = useState<PhoneNumber | null>(
    null,
  );

  const mobileSetterRef = useRef<Dispatch<SetStateAction<PhoneNumber>>>();

  useEffect(() => {
    const {current: mobileSetter} = mobileSetterRef;
    if (mobileSetter && selectedMobile) {
      mobileSetter(selectedMobile);
    }
  }, [selectedMobile]);

  const formFields: FormFields<FormFieldName> = useMemo(
    () => ({
      name: {
        type: 'text',
        props: {
          label: 'Customer Name',
        },
        required: true,
      },
      mobile: {
        type: 'mobile',
        props: {
          label: 'Phone Number (Optional)',
          action: (
            <Touchable
              onPress={() => {
                selectContactPhone().then((selection) => {
                  if (!selection) {
                    return;
                  }
                  let {selectedPhone} = selection;
                  const number = getContactService().formatPhoneNumber(
                    selectedPhone?.number,
                  );
                  const phoneNumber = parsePhoneNumberFromString(number);
                  if (phoneNumber) {
                    setSelectedMobile({
                      callingCode: String(phoneNumber.countryCallingCode),
                      number: String(phoneNumber.nationalNumber),
                    });
                  }
                });
              }}>
              <Text
                style={applyStyles(
                  'text-400 text-red-200 text-uppercase text-xs',
                )}>
                IMPORT FROM CONTACT
              </Text>
            </Touchable>
          ),
          getValueSetter: (mobileSetter) => {
            mobileSetterRef.current = mobileSetter;
          },
        },
      },
      email: {
        type: 'text',
        props: {
          label: 'Email (Optional)',
          keyboardType: 'email-address',
        },
      },
      saveToPhonebook: {
        type: 'radio',
        props: {
          label: 'Save to Phonebook',
          value: true,
          disabled: false,
        },
      },
    }),
    [],
  );

  return (
    <Page
      header={{title: 'Add Customer', iconLeft: {}}}
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
      />
    </Page>
  );
};
