import {FormBuilder, FormFields, Button, PhoneNumber} from '@/components';
import {getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useMemo, useRef} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import {Page} from '@/components/Page';
import parsePhoneNumber from 'libphonenumber-js';
import {UserProfileFormPayload} from '@/services/api';

export const UserProfileSettings = () => {
  const authService = getAuthService();
  const apiService = getApiService();

  const user = authService.getUser();
  const navigation = useAppNavigation();
  const {firstname, lastname, email, mobile = '', country_code = ''} =
    user || {};

  const formFields = useMemo(() => {
    const phoneNumber = parsePhoneNumber('+' + mobile);
    const nationalNumber = (phoneNumber?.nationalNumber ?? '') as string;
    const fields: FormFields<
      keyof Omit<UserProfileFormPayload, 'country_code'>
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
          label: 'Phone Number',
          editable: false,
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

  const formValuesRef = useRef<UserProfileFormPayload>();

  const handleSubmit = useCallback(async () => {
    const {current: formValues} = formValuesRef;
    if (!formValues) {
      return;
    }
    try {
      await apiService.userProfileUpdate(formValues);
      ToastAndroid.show(
        'User profile updated successfully',
        ToastAndroid.SHORT,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [apiService, navigation]);

  return (
    <Page
      header={{title: 'Profile Settings', iconLeft: {}}}
      footer={<Button title={'Save'} onPress={handleSubmit} />}
      style={applyStyles('bg-white')}>
      <FormBuilder
        fields={formFields}
        onInputChange={(values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          formValuesRef.current = {
            ...values,
            mobile: phoneNumber.number,
            country_code: phoneNumber.callingCode,
          };
        }}
      />
    </Page>
  );
};
