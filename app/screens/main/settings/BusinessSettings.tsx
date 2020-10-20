import {AuthView, BusinessForm, BusinessFormPayload} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {getAnalyticsService, getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import React, {useCallback} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ToastAndroid} from 'react-native';

export const BusinessSettings = () => {
  const handleError = useErrorHandler();
  const authService = getAuthService();
  const apiService = getApiService();
  const navigation = useAppNavigation();

  const user = authService.getUser();
  const {name, id, mobile, address, profile_image} = user?.businesses
    ? user?.businesses[0]
    : {name: '', mobile: '', address: '', profile_image: {url: ''}, id: ''};
  const businessFormIntialValues = {
    name,
    mobile,
    address,
    profileImageFile: {uri: profile_image?.url},
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
        user?.businesses
          ? await apiService.businessSetupUpdate(payload, id)
          : await apiService.businessSetup(payload);
        getAnalyticsService()
          .logEvent('businessSetupComplete')
          .catch(handleError);
        ToastAndroid.show(
          'Business settings update successful',
          ToastAndroid.SHORT,
        );
        navigation.goBack();
      } catch (error) {
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
        onSubmit={handleSubmit}
        initalValues={businessFormIntialValues}
      />
    </AuthView>
  );
};
