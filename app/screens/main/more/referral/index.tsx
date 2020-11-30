import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {getApiService, getAuthService} from '@/services';
import {applyStyles} from '@/styles';
import {useAppNavigation} from 'app-v2/services/navigation';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Alert, View} from 'react-native';
import {getAndroidId} from 'react-native-device-info';

export default function ReferralScreen() {
  const apiService = getApiService();
  const navigation = useAppNavigation();
  const user = getAuthService().getUser();

  const [deviceId, setDeviceId] = useState('');
  const [code, setCode] = useState(user?.referrer_code ?? '');
  const {showSuccessToast} = useContext(ToastContext);

  const handleChange = useCallback((text) => {
    setCode(text);
  }, []);

  const handleSubmit = useCallback(async () => {
    const payload = {
      referrer_code: code,
      device_id: deviceId,
    };
    try {
      await apiService.userProfileUpdate(payload);
      showSuccessToast('Referral code submitted successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [apiService, code, deviceId, navigation, showSuccessToast]);

  const fetchDeviceId = useCallback(async () => {
    const id = await getAndroidId();
    setDeviceId(id);
  }, []);

  useEffect(() => {
    return () => {
      fetchDeviceId();
    };
  }, [fetchDeviceId]);

  return (
    <Page
      header={{title: 'Referral', iconLeft: {}}}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <AppInput
          value={code}
          label="Referral Code"
          onChangeText={handleChange}
          style={applyStyles('mb-16')}
          placeholder="Enter referral code here"
        />
        <Button title="Submit" onPress={handleSubmit} disabled={!code} />
      </View>
    </Page>
  );
}
