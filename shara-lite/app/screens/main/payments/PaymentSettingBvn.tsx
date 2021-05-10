import Emblem from '@/assets/images/emblem-gray.svg';
import {AppInput, Button} from '@/components';
import {Page} from '@/components/Page';
import {
  getApiService,
  getAuthService,
  getI18nService,
  getRemoteConfigService,
  getStorageService,
} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {applyStyles} from '@/styles';
import React, {useCallback, useMemo, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {User} from 'types/app';

const strings = getI18nService().strings;

export const PaymentSettingBvn = () => {
  const navigation = useAppNavigation();
  const [idNumber, setIdNumber] = useState('');
  const authService = getAuthService();

  const countryCode = authService.getUser()?.country_code;
  const idType = useMemo(() => {
    switch (countryCode) {
      case '234':
        return 'BVN number';
      case '254':
        return 'National ID';
      default:
        return 'ID number';
    }
  }, [countryCode]);

  const handleIdNumberChange = React.useCallback((data) => {
    setIdNumber(data);
  }, []);

  const handleSubmit = useCallback(async () => {
    const apiService = getApiService();
    try {
      let user = authService.getUser() as User;
      const payload = {idNumber};
      let idValue = true;

      await apiService.verify(payload);
      if (user?.country_code !== '234') {
        const userInfo = {
          ...user,
          is_identity_verified: true,
        };
        authService.setUser(userInfo);
        await getStorageService().setItem('user', userInfo);
        navigation.navigate('DisbursementScreen');
      } else {
        const bvnVerificationEnabled = getRemoteConfigService()
          .getValue('enableBVNVerification')
          .asBoolean();
        if (bvnVerificationEnabled) {
          navigation.navigate('BVNVerification');
        } else {
          await getStorageService().setItem('bvn', idValue);
          navigation.navigate('DisbursementScreen');
        }
      }
    } catch (error) {
      Alert.alert(strings('alert.error'), error.message);
    }
  }, [authService, idNumber, navigation]);

  return (
    <Page style={applyStyles('px-14')}>
      <View style={applyStyles('center pb-32')}>
        <Emblem width={64} height={64} />
        <Text
          style={applyStyles('text-center text-gray-200 text-base pt-16 px-8')}>
          {strings('payment.withdrawal_method.id_description', {idType})}
        </Text>
      </View>
      <AppInput
        value={idNumber}
        onChangeText={handleIdNumberChange}
        keyboardType="numeric"
        placeholder={strings(
          'payment.withdrawal_method.id_input_field_placeholder',
          {idType},
        )}
      />
      <View style={applyStyles('pt-24 items-center')}>
        <Button
          title={strings('next')}
          onPress={handleSubmit}
          style={applyStyles({width: '48%'})}
        />
      </View>
    </Page>
  );
};
