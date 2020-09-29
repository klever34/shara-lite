import {AuthView, BusinessForm, BusinessFormPayload} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import React, {useCallback} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ToastAndroid} from 'react-native';

export const BusinessSettings = () => {
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const apiService = getApiService();

  const user = authService.getUser();
  const {name, id, mobile, address, profile_image_url} =
    user?.businesses[0] || {};
  const businessFormIntialValues = {
    name,
    mobile,
    address,
    profileImageFile: {uri: profile_image_url},
  } as BusinessFormPayload;

  const handleSubmit = useCallback(
    async (data?: BusinessFormPayload) => {
      const payload = new FormData();
      payload.append('name', data?.name);
      data?.mobile && payload.append('mobile', data?.mobile);
      payload.append('address', data?.address);
      data?.profileImageFile &&
        Object.keys(data?.profileImageFile).length > 1 &&
        payload.append('profileImageFile', data?.profileImageFile);

      try {
        await apiService.businessSetupUpdate(payload, id);
        getAnalyticsService()
          .logEvent('businessSetupComplete')
          .catch(handleError);
        ToastAndroid.show(
          'Business settings update successful',
          ToastAndroid.SHORT,
        );
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    },
    [apiService, id, handleError],
  );

  return (
    <AuthView
      title="Business Settings"
      style={applyStyles({paddingBottom: 100})}
      description="Create an account to do business faster and better.">
      <BusinessForm
        page="settings"
        onSubmit={handleSubmit}
        initalValues={businessFormIntialValues}
      />
    </AuthView>
  );
};
