import {AuthView, UserProfileForm, UserProfileFormPayload} from '@/components';
import {applyStyles} from '@/helpers/utils';
import {getApiService, getAuthService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import React, {useCallback} from 'react';
import {Alert, ToastAndroid} from 'react-native';

export const UserProfileSettings = () => {
  const authService = getAuthService();
  const apiService = getApiService();

  const user = authService.getUser();
  const navigation = useAppNavigation();
  const {firstname, id, lastname, email, mobile, country_code} = user || {};
  const formIntialValues = {
    email,
    mobile,
    lastname,
    firstname,
    country_code,
  } as UserProfileFormPayload;

  const handleSubmit = useCallback(
    async (data: UserProfileFormPayload) => {
      try {
        await apiService.userProfileUpdate(data);
        ToastAndroid.show(
          'User profile updated successfully',
          ToastAndroid.SHORT,
        );
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    },
    [navigation, apiService],
  );

  return (
    <AuthView
      title="User Profile"
      style={applyStyles({paddingBottom: 100})}
      description={`USER ID: ${id}`}>
      <UserProfileForm
        onSubmit={handleSubmit}
        initalValues={formIntialValues}
      />
    </AuthView>
  );
};
