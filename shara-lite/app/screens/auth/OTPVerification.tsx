import {AuthView, Button} from '@/components';
import {ToastContext} from '@/components/Toast';
import {getAnalyticsService, getApiService} from '@/services';
import {useAppNavigation} from '@/services/navigation';
import {useInitRealm} from '@/services/realm';
import {applyStyles, colors} from '@/styles';
import {RouteProp, useRoute} from '@react-navigation/native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useErrorHandler} from 'react-error-boundary';
import {Alert, Text, TouchableOpacity, View} from 'react-native';
import {getAndroidId} from 'react-native-device-info';
import RNOtpVerify from 'react-native-otp-verify';
import {AuthStackParamList} from '.';

export const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const {showSuccessToast} = useContext(ToastContext);
  const {params} = useRoute<RouteProp<AuthStackParamList, 'OTPVerification'>>();

  const {initRealm} = useInitRealm();
  const handleError = useErrorHandler();
  const navigation = useAppNavigation();
  const [hash, setHash] = useState('');

  const handleOtpChange = React.useCallback((code) => {
    setOtp(code);
  }, []);

  const handleResendSubmit = useCallback(async () => {
    const {mobile, countryCode} = params;
    const apiService = getApiService();
    try {
      const device_id = await getAndroidId();
      const payload = {
        hash,
        mobile,
        device_id,
        country_code: countryCode,
      };
      await apiService.otp(payload);
      showSuccessToast('OTP RESENT');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  }, [hash, showSuccessToast, params]);

  const handleSubmit = useCallback(
    async (code: string) => {
      if (code) {
        const payload = {password: code, mobile: params.mobile};
        const apiService = getApiService();
        setLoading(true);
        try {
          await apiService.logIn(payload);
          await initRealm({initSync: true});

          getAnalyticsService()
            .logEvent('login', {method: 'mobile'})
            .catch(handleError);
          setLoading(false);
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        } catch (error) {
          setLoading(false);
          Alert.alert('Error', error.message);
        }
      }
    },
    [handleError, initRealm, navigation, params.mobile],
  );

  useEffect(() => {
    RNOtpVerify.getOtp()
      .then(() => {
        RNOtpVerify.addListener((message) => {
          try {
            if (message) {
              const code = /(\d{6})/g.exec(message);
              if (code) {
                setOtp(code[1]);
              }
            }
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });

    // remove listener on unmount
    return () => {
      RNOtpVerify.removeListener();
    };
  }, []);

  const getHash = () =>
    RNOtpVerify.getHash()
      .then((text) => setHash(text[0]))
      .catch(console.log);

  useEffect(() => {
    getHash();
  }, []);

  return (
    <AuthView showBackButton={true} heading="OTP" description={params.message}>
      <View style={applyStyles('items-center')}>
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
        <View style={applyStyles('mb-24')}>
          <TouchableOpacity
            style={applyStyles('flex-row center')}
            onPress={handleResendSubmit}>
            <Text style={applyStyles('text-gray-100 text-base')}>
              Didn't receive the code?{' '}
            </Text>
            <Text
              style={applyStyles({
                fontSize: 16,
                color: colors.black,
                textDecorationStyle: 'solid',
                textDecorationLine: 'underline',
                textDecorationColor: colors.black,
              })}>
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          variantColor="red"
          title="Get Started"
          isLoading={loading}
          style={applyStyles('w-full')}
          onPress={() => handleSubmit(otp)}
        />
      </View>
    </AuthView>
  );
};
