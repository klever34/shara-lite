import {Button} from '@/components';
import {
  getApiService,
  getAuthService,
  getI18nService,
  getStorageService,
} from '@/services';
import {applyStyles, colors} from '@/styles';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useMemo, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {useAppNavigation} from '@/services/navigation';
import Emblem from '@/assets/images/emblem-gray.svg';
import {Page} from '@/components/Page';
import {User} from 'types/app';

const strings = getI18nService().strings;

export const BVNVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useAppNavigation();
  const authService = getAuthService();
  const storageService = getStorageService();
  let user = authService.getUser() as User;

  const countryCode = user.country_code;
  const idType = useMemo(() => {
    switch (countryCode) {
      case '234':
        return 'BVN';
      case '254':
        return 'National ID';
      default:
        return 'ID number';
    }
  }, [countryCode]);

  const handleOtpChange = React.useCallback((code) => {
    setOtp(code);
  }, []);

  const handleSubmit = useCallback(
    async (otp: string) => {
      const apiService = getApiService();
      setLoading(true);
      try {
        const payload = {otp};
        await apiService.validate(payload);
        let userInfo = {
          ...user,
          is_identity_verified: true,
        };
        authService.setUser(userInfo);
        await storageService.setItem('user', userInfo);
        setLoading(false);
        navigation.navigate('DisburementScreen');
      } catch (error) {
        setLoading(false);
        Alert.alert(strings('alert.error'), error.message);
      }
    },
    [user, authService, navigation, otp, storageService],
  );

  return (
    <Page
      header={{
        title: strings('payment.payment_container.payment_settings'),
        style: applyStyles('py-10'),
        iconLeft: {},
      }}
      style={applyStyles('px-32')}>
      <View style={applyStyles('center pt-32')}>
        <View style={applyStyles('items-center')}>
          <Emblem width={64} height={64} />
        </View>
        <Text
          style={applyStyles('text-center text-gray-200 text-base pt-16 px-8')}>
          {strings('payment.withdrawal_method.id_otp_description', {
            mobile: `+${user.mobile}`,
            idType,
          })}
        </Text>
        <OTPInputView
          code={otp}
          pinCount={6}
          autoFocusOnLoad={true}
          placeholderCharacter="•"
          style={applyStyles({
            width: '100%',
            height: 100,
          })}
          onCodeFilled={handleSubmit}
          placeholderTextColor="#C4C4C4"
          onCodeChanged={handleOtpChange}
          codeInputFieldStyle={applyStyles('w-45 h-45 text-black', {
            fontSize: 18,
            borderWidth: 0,
            borderRadius: 0,
            borderBottomWidth: 1,
          })}
          codeInputHighlightStyle={applyStyles({
            borderColor: colors.primary,
          })}
        />
        <Button
          isLoading={loading}
          onPress={() => handleSubmit(otp)}
          title={strings('done')}
          style={applyStyles('w-full', {width: '48%'})}
        />
      </View>
    </Page>
  );
};
