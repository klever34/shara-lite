import {ICustomer} from '@/models';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {
  Button,
  FormBuilder,
  FormFields,
  PhoneNumber,
} from '../../../components';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';
import {useAddCustomer} from '@/services/customer/hooks';

type AddCustomerProps = {
  onSubmit?: (customer: ICustomer) => void;
};

export const AddCustomer = (props: AddCustomerProps) => {
  const {onSubmit} = props;
  const navigation = useNavigation();
  const addCustomer = useAddCustomer();

  type FormFieldName = 'name' | 'mobile' | 'email';

  const formFields: FormFields<FormFieldName> = {
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
      },
    },
    email: {
      type: 'text',
      props: {
        label: 'Email (Optional)',
        keyboardType: 'email-address',
      },
    },
  };

  const formValuesRef = useRef<Record<FormFieldName, any>>();
  const requiredFieldsFilledRef = useRef<boolean>(false);

  const onFormSubmit = useCallback(() => {
    const values = formValuesRef.current as ICustomer;
    const requiredFieldsFilled = requiredFieldsFilledRef.current;
    if (!requiredFieldsFilled) {
      return;
    }
    addCustomer(values);
    onSubmit ? onSubmit(values) : navigation.goBack();
  }, [addCustomer, onSubmit, navigation]);

  const footer = <Button title="Add" onPress={onFormSubmit} />;

  return (
    <Page
      header={{title: 'Add Customer', iconLeft: {}}}
      footer={footer}
      style={applyStyles('bg-white')}>
      <FormBuilder
        fields={formFields}
        onInputChange={(values, required) => {
          const phoneNumber = values.mobile as PhoneNumber;
          formValuesRef.current = {
            ...values,
            mobile: `+${phoneNumber.callingCode}${phoneNumber.number}`,
          };
          requiredFieldsFilledRef.current = required;
        }}
      />
    </Page>
  );
};
