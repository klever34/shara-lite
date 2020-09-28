import {AuthView} from '@/components/AuthView';
import {getAnalyticsService, getApiService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import {BusinessForm} from '@/components';
import {applyStyles} from '@/helpers/utils';

export const BusinessSetup = () => {
  const handleError = useErrorHandler();
  const apiService = getApiService();
  const navigation = useNavigation();

  useEffect(() => {
    getAnalyticsService().logEvent('businessSetupStart').catch(handleError);
  }, [handleError]);

  const handleSkip = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Main'}],
    });
  }, [navigation]);

  const handleSubmit = useCallback(
    async (data?: any) => {
      const payload = new FormData();
      payload.append('name', data.name);
      payload.append('address', data.address);
      try {
        await apiService.businessSetup(payload);
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
        getAnalyticsService()
          .logEvent('businessSetupComplete')
          .catch(handleError);
        ToastAndroid.show('Business setup successful', ToastAndroid.SHORT);
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    },
    [apiService, navigation, handleError],
  );

  return (
    <AuthView
      title="Business Setup"
      style={applyStyles({marginBottom: 100})}
      description="Create an account to do business faster and better.">
      <BusinessForm page="setup" onSkip={handleSkip} onSubmit={handleSubmit} />
    </AuthView>
  );
};
