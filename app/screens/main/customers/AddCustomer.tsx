import {ICustomer} from '@/models';
import {getCustomers, saveCustomer} from '@/services/customer/service';
import {useRealm} from '@/services/realm';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import {
  Button,
  FormBuilder,
  FormFields,
  PhoneNumber,
} from '../../../components';
import {applyStyles} from '@/styles';
import {Page} from '@/components/Page';

type Props = {
  onSubmit?: (customer: ICustomer) => void;
};

export const AddCustomer = (props: Props) => {
  const {onSubmit} = props;
  const navigation = useNavigation();
  const realm = useRealm() as Realm;
  const customers = getCustomers({realm});

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

  const onFormSubmit = useCallback(() => {
    const values = formValuesRef.current as ICustomer;
    if (customers.filtered('mobile = $0', values.mobile).length) {
      Alert.alert(
        'Info',
        'Customer with the same phone number has been created.',
      );
    } else {
      saveCustomer({realm, customer: values});
      onSubmit ? onSubmit(values) : navigation.goBack();
      ToastAndroid.showWithGravityAndOffset(
        'Customer added',
        ToastAndroid.SHORT,
        ToastAndroid.TOP,
        0,
        52,
      );
    }
  }, [navigation, realm, onSubmit, customers]);

  const footer = <Button title="Add" onPress={onFormSubmit} />;

  return (
    <Page
      header={{title: 'Add Customer', iconLeft: {}}}
      footer={footer}
      style={applyStyles('bg-white')}>
      <FormBuilder
        fields={formFields}
        onInputChange={(values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          formValuesRef.current = {
            ...values,
            mobile: `+${phoneNumber.callingCode}${phoneNumber.number}`,
          };
        }}
      />
    </Page>
  );
};
