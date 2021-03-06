import {AuthView, BusinessForm, BusinessFormPayload} from 'app-v2/components';
import {applyStyles} from 'app-v2/helpers/utils';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
} from 'app-v2/services';
import {useIPGeolocation} from 'app-v2/services/ip-geolocation/provider';
import {useAppNavigation} from 'app-v2/services/navigation';
import React, {useCallback, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ToastAndroid} from 'react-native';

export const BusinessSettings = () => {
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const apiService = getApiService();
  const navigation = useAppNavigation();
  const {callingCode} = useIPGeolocation();

  const user = authService.getUser();
  const businessInfo = authService.getBusinessInfo();
  const {name, id, mobile, address, country_code, profile_image} = businessInfo;
  const code = country_code || callingCode;
  const businessMobile =
    code && mobile?.startsWith(code) ? mobile.replace(code, '') : mobile;
  const businessFormIntialValues = {
    name,
    address,
    countryCode: code,
    mobile: businessMobile,
    profileImageFile: {uri: profile_image?.url ?? ''},
  } as BusinessFormPayload;

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data?: BusinessFormPayload) => {
      const payload = new FormData();
      payload.append('name', data?.name);
      payload.append('address', data?.address);
      data?.mobile && payload.append('mobile', data?.mobile);
      data?.countryCode && payload.append('country_code', data?.countryCode);
      data?.profileImageFile &&
        Object.keys(data?.profileImageFile).length > 1 &&
        payload.append('profileImageFile', data?.profileImageFile);
      try {
        setIsLoading(true);
        user?.businesses && user.businesses.length
          ? await apiService.businessSetupUpdate(payload, id)
          : await apiService.businessSetup(payload);
        getAnalyticsService()
          .logEvent('businessSetupComplete')
          .catch(handleError);
        setIsLoading(false);
        ToastAndroid.show(
          'Business settings update successful',
          ToastAndroid.SHORT,
        );
        navigation.goBack();
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', error.message);
      }
    },
    [user, apiService, navigation, id, handleError],
  );

  return (
    <AuthView
      title="Business Settings"
      style={applyStyles({paddingBottom: 100})}
      description="Create an account to do business faster and better.">
      <BusinessForm
        page="settings"
        isLoading={isLoading}
        onSubmit={handleSubmit}
        initalValues={businessFormIntialValues}
      />
    </AuthView>
  );
};
