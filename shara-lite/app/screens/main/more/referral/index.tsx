import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {ToastContext} from '@/components/Toast';
import {
  getAnalyticsService,
  getApiService,
  getAuthService,
  getI18nService,
} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useContext, useState} from 'react';
import {Alert, View} from 'react-native';
import {getAndroidId} from 'react-native-device-info';

const i18Service = getI18nService();

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
      showSuccessToast(i18Service.strings('referral.toast_text'));
      getAnalyticsService()
        .logEvent('referralCodeAdded', {})
        .then(() => {});
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [apiService, code, navigation, showSuccessToast]);

  return (
    <Page
      header={{
        title: i18Service.strings('referral.title'),
        iconLeft: {},
        style: applyStyles('py-8'),
      }}
      style={applyStyles('bg-white')}>
      <View style={applyStyles('flex-1')}>
        <AppInput
          value={code}
          onChangeText={handleChange}
          style={applyStyles('mb-16')}
          label={i18Service.strings('referral.fields.code.label')}
          placeholder={i18Service.strings('referral.fields.code.placeholder')}
        />
        <Button
          disabled={!code}
          onPress={handleSubmit}
          title={i18Service.strings('referral.submit_button')}
        />
      </View>
    </Page>
  );
}
