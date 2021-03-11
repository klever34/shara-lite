import {FormBuilder, FormFields, PhoneNumber} from '@/components';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getI18nService,
} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useContext, useMemo} from 'react';
import {Alert} from 'react-native';
import {Page} from '@/components/Page';
import parsePhoneNumber from 'libphonenumber-js';
import {UserProfileFormPayload} from '@/services/api';
import {ToastContext} from '@/components/Toast';
import {handleError} from '@/services/error-boundary';

const i18nService = getI18nService();

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
          label: i18nService.strings('profile_settings.fields.firstName.label'),
          containerStyle: applyStyles({width: '48%', marginRight: '2%'}),
        },
      },
      lastname: {
        type: 'text',
        props: {
          value: lastname,
          label: i18nService.strings('profile_settings.fields.lastName.label'),
          containerStyle: applyStyles({width: '48%', marginLeft: '2%'}),
        },
      },
      mobile: {
        type: 'mobile',
        props: {
          value: {number: nationalNumber, callingCode: country_code},
          label: i18nService.strings('profile_settings.fields.mobile.label'),
          editable: false,
          focusable: false,
        },
      },
      email: {
        type: 'text',
        props: {
          value: email,
          label: i18nService.strings('profile_settings.fields.email.label'),
          keyboardType: 'email-address',
          rightIcon: 'mail',
        },
      },
    };
    return fields;
  }, [country_code, email, firstname, lastname, mobile]);

  return (
    <Page
      header={{
        title: i18nService.strings('profile_settings.title'),
        iconLeft: {},
        style: applyStyles({}),
      }}
      style={applyStyles('bg-white')}>
      <FormBuilder
        forceUseFormButton
        fields={formFields}
        actionBtns={[
          undefined,
          {title: i18nService.strings('profile_settings.save_button')},
        ]}
        onSubmit={async (values) => {
          const phoneNumber = values.mobile as PhoneNumber;
          const formValues = {
            ...values,
            mobile: phoneNumber.number,
            country_code: phoneNumber.callingCode,
          };
          try {
            await apiService.userProfileUpdate(formValues);
            showSuccessToast(
              i18nService.strings('profile_settings.toast_text'),
            );
            getAnalyticsService()
              .logEvent('userProfileUpdated', {})
              .then(() => {})
              .catch(handleError);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }}
      />
    </Page>
  );
};
