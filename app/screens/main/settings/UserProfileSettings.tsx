import {AuthView, UserProfileForm, UserProfileFormPayload} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {getAnalyticsService, getAuthService} from '@/services';
import React, {useCallback} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, ToastAndroid} from 'react-native';

export const UserProfileSettings = () => {
  const handleError = useErrorHandler();
  const authService = getAuthService();
  //   const apiService = getApiService();

  const user = authService.getUser();
  const {firstname, lastname, email, mobile, country_code} = user || {};
  const formIntialValues = {
    email,
    mobile,
    lastname,
    firstname,
    country_code,
  } as UserProfileFormPayload;

  const handleSubmit = useCallback(
    async (data?: UserProfileFormPayload) => {
      console.log(data);
      try {
        // await apiService.businessSetupUpdate(payload, id);
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
    [handleError],
  );

  return (
    <AuthView
      title="User Profile"
      style={applyStyles({paddingBottom: 100})}
      description="Create an account to do business faster and better.">
      <UserProfileForm
        onSubmit={handleSubmit}
        initalValues={formIntialValues}
      />
    </AuthView>
  );
};
