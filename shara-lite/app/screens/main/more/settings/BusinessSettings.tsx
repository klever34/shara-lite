import {
  BusinessFormPayload,
  FormBuilder,
  FormFields,
  PhoneNumber,
} from '@/components';
import {Page} from '@/components/Page';
import {showToast} from '@/helpers/utils';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import {useIPGeolocation} from '@/services/ip-geolocation/provider';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useMemo} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert} from 'react-native';

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
    slug,
    address,
    mobile = '',
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
      slug: {
        type: 'text',
        props: {
          value: slug,
          rightIcon: 'globe',
          label: 'Enter your payment link?',
        },
        validations: [
          (fieldName, values) => {
            if (values[fieldName].match(/[^a-z-0-9]/)) {
              return 'Payment link should contain only lowercase and dash';
            }
            return null;
          },
        ],
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
  }, [address, callingCode, mobile, name, slug, profile_image]);

  const handleSubmit = useCallback(
    async (formValues) => {
      const phoneNumber = formValues.mobile as PhoneNumber;
      formValues = {
        ...formValues,
        mobile: phoneNumber.number,
        countryCode: phoneNumber.callingCode,
      };
      const payload = new FormData();
      payload.append('name', formValues?.name);
      payload.append('address', formValues?.address);
      formValues?.slug && payload.append('slug', formValues?.slug);
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
        showToast({message: 'Business settings update successful'});
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    },
    [user, apiService, navigation, id, handleError],
  );

  return (
    <Page
      header={{title: 'Business Settings', iconLeft: {}}}
      style={applyStyles('bg-white')}>
      <>
        <FormBuilder
          fields={formFields}
          submitBtn={{title: 'Save'}}
          onSubmit={handleSubmit}
        />
      </>
    </Page>
  );
};
