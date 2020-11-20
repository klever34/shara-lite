import {
  BusinessFormPayload,
  Button,
  FormBuilder,
  FormFields,
  PhoneNumber,
} from '@/components';
import {Page} from '@/components/Page';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert} from 'react-native';
import {ToastContext} from '@/components/Toast';

export const BusinessSettings = () => {
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const apiService = getApiService();
  const navigation = useAppNavigation();
  let {callingCode} = useIPGeolocation();
  const user = authService.getUser();
  const businessInfo = authService.getBusinessInfo();
  const {
    name,
    id,
    mobile = '',
    address,
    country_code,
    profile_image,
  } = businessInfo;
  callingCode = country_code ?? callingCode;

  const formFields = useMemo(() => {
    const fields: FormFields<keyof Omit<BusinessFormPayload, 'countryCode'>> = {
      name: {
        type: 'text',
        props: {
          value: name,
          label: "What's the name of your business",
          rightIcon: 'home',
        },
      },
      mobile: {
        type: 'mobile',
        props: {
          value: {
            number: mobile?.startsWith(callingCode)
              ? mobile.replace(callingCode, '')
              : mobile,
            callingCode: callingCode,
          },
          label: "What's your business phone number",
        },
      },
      address: {
        type: 'text',
        props: {
          value: address,
          label: 'where is your business located?',
          rightIcon: 'map-pin',
        },
      },
      profileImageFile: {
        type: 'image',
        props: {
          label: 'Business logo',
          placeholder: 'Upload logo',
          value: {uri: profile_image?.url ?? ''},
        },
      },
    };
    return fields;
  }, [address, callingCode, mobile, name, profile_image]);

  const formValuesRef = useRef<BusinessFormPayload>();
  const {showSuccessToast} = useContext(ToastContext);
  const handleSubmit = useCallback(async () => {
    const {current: formValues} = formValuesRef;
    if (!formValues) {
      return;
    }
    const payload = new FormData();
    payload.append('name', formValues?.name);
    payload.append('address', formValues?.address);
    formValues?.mobile && payload.append('mobile', formValues?.mobile);
    formValues?.countryCode &&
      payload.append('country_code', formValues?.countryCode);
    formValues?.profileImageFile &&
      Object.keys(formValues?.profileImageFile).length > 1 &&
      payload.append('profileImageFile', formValues?.profileImageFile);
    try {
      user?.businesses && user.businesses.length
        ? await apiService.businessSetupUpdate(payload, id)
        : await apiService.businessSetup(payload);
      getAnalyticsService()
        .logEvent('businessSetupComplete', {})
        .catch(handleError);
      showSuccessToast('Business settings update successful');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [user, apiService, id, handleError, showSuccessToast, navigation]);

  return (
    <Page
      header={{title: 'Business Settings', iconLeft: {}}}
      footer={<Button title={'Save'} onPress={handleSubmit} />}
      style={applyStyles('bg-white')}>
      <>
        <FormBuilder
          fields={formFields}
          onInputChange={(values) => {
            const phoneNumber = values.mobile as PhoneNumber;
            formValuesRef.current = {
              ...values,
              mobile: phoneNumber.number,
              countryCode: phoneNumber.callingCode,
            };
          }}
        />
      </>
    </Page>
  );
};
