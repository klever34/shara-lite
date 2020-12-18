import {FormBuilder, FormFields, PhoneNumber} from '@/components';
import {getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useContext, useMemo} from 'react';
import {Alert} from 'react-native';
import {Page} from '@/components/Page';
import parsePhoneNumber from 'libphonenumber-js';
import {UserProfileFormPayload} from '@/services/api';
import {ToastContext} from '@/components/Toast';

export const UserProfileSettings = () => {
  const authService = getAuthService();
  const apiService = getApiService();

  const user = authService.getUser();
  const navigation = useAppNavigation();
  const {firstname, lastname, email, mobile = '', country_code = ''} =
    user || {};
  const {showSuccessToast} = useContext(ToastContext);
  const formFields = useMemo(() => {
    const phoneNumber = parsePhoneNumber('+' + mobile);
    const nationalNumber = (phoneNumber?.nationalNumber ?? '') as string;
    const fields: FormFields<
      keyof Omit<
        UserProfileFormPayload,
        'country_code' | 'referrer_code' | 'device_id'
      >
    > = {
      firstname: {
        type: 'text',
        props: {
          value: firstname,
          label: 'First Name',
          containerStyle: applyStyles({width: '48%', marginRight: '2%'}),
        },
      },
      lastname: {
        type: 'text',
        props: {
          value: lastname,
          label: 'Last Name',
          containerStyle: applyStyles({width: '48%', marginLeft: '2%'}),
        },
      },
      mobile: {
        type: 'mobile',
        props: {
          value: {number: nationalNumber, callingCode: country_code},
          label: 'What’s your phone number?',
          editable: false,
          focusable: false,
        },
      },
      email: {
        type: 'text',
        props: {
          value: email,
          label: "What's your email? (Optional)",
          keyboardType: 'email-address',
          rightIcon: 'mail',
        },
      },
    };
    return fields;
  }, [country_code, email, firstname, lastname, mobile]);

  return (
    <Page
      header={{title: 'Profile Settings', iconLeft: {}}}
      style={applyStyles('bg-white')}>
      <FormBuilder
        forceUseFormButton
        fields={formFields}
        actionBtns={[undefined, {title: 'Save'}]}
        onSubmit={async (values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          const formValues = {
            ...values,
            mobile: phoneNumber.number,
            country_code: phoneNumber.callingCode,
          };
          try {
            await apiService.userProfileUpdate(formValues);
            showSuccessToast('User profile updated successfully');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }}
      />
    </Page>
  );
};
