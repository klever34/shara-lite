import {AuthView, BusinessForm} from '@/components';
import {getAnalyticsService, getApiService} from '@/services';
import {useErrorHandler} from '@/services/error-boundary';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, ToastAndroid} from 'react-native';
import {applyStyles} from '@/styles';

export const BusinessSetup = () => {
  const handleError = useErrorHandler();
  const apiService = getApiService();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        await apiService.businessSetup(payload);
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
        getAnalyticsService()
          .logEvent('businessSetupComplete')
          .catch(handleError);
        setIsLoading(false);
        ToastAndroid.show('Business setup successful', ToastAndroid.SHORT);
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', error.message);
      }
    },
    [apiService, navigation, handleError],
  );

  return (
    <AuthView
      title="Business Setup"
      showBackButton={false}
      style={applyStyles({marginBottom: 100})}
      description="Create an account to do business faster and better.">
      <BusinessForm
        page="setup"
        onSkip={handleSkip}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </AuthView>
  );
};
