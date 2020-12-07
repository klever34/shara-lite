import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {getApiService, getAuthService} from '@/services';
import {applyStyles} from '@/styles';
import {useAppNavigation} from 'app-v2/services/navigation';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, View} from 'react-native';
import {getAndroidId} from 'react-native-device-info';

export default function ReferralScreen() {
  const apiService = getApiService();
  const navigation = useAppNavigation();
  const user = getAuthService().getUser();

  const [code, setCode] = useState(user?.referrer_code ?? '');
  const {showSuccessToast} = useContext(ToastContext);

  const handleChange = useCallback((text) => {
    setCode(text);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const id = await getAndroidId();
      const payload: any = {
        referrer_code: code,
        device_id: id,
      };
      await apiService.userProfileUpdate(payload);
      showSuccessToast('Referral code submitted');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [apiService, code, navigation, showSuccessToast]);

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
